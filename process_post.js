const { prototype } = require('events');
const fs = require('fs');
const { url } = require('inspector');
const { type } = require('os');
const { resolve } = require('path');
const readline = require('readline');

/// The root file relative to our pug.config.js
const src_dir = "./src";
const dist_dir = "./dist"

// A objet that serves as a detailed
// catalog of the post
let post_catalog = [];

// A list of the keys of the post to
// be renamed and published.
let post_to_publish = [];

// some regex to check against when prosessing the files
const meta_regex = new RegExp(/^\s*-\s*\w+\s*=.*$/);
const status_line_regex = new RegExp(/^\s*-\s*status\s*=.*$/); 
const ref_updir_line_regex = new RegExp(/^.*\.\.\/\.\..*$/);

const dotpug_regex = new RegExp(/.+pug$/);
const list_pug_regex = new RegExp(/list\.pug$/);
// markdown **
// Ignores the code blocks asuming that will be
// way more indented that paraphs and footnotes.
// valid_indentation = /(?<=^\s{1,5}\|?.*)/;
const backticks_closed_words      = new RegExp(/(?<=^\s{1,5}\|?.*)`[^`]*`/,'g');
const markdown_is_bold_and_italic = new RegExp(/(?<=^\s{1,5}\|?.*)\*\*\*[^*]*\*\*\*/,'g');
const markdown_is_just_bold       = new RegExp(/(?<=^\s{1,5}\|?.*)\*\*[^*]*\*\*/,'g');
const markdown_is_just_italic     = new RegExp(/(?<=^\s{1,5}\|?.*)\*[^*]*\*/,'g');


const string_equivalent = { 
  'Á':'A', 'É':'E', 'Í':'I', 'Ó':'O', 'Ú':'U', 'Ñ':'N',
  'á':'a', 'é':'e', 'í':'i', 'ó':'o', 'ú':'u', 'ö':'o', 'ñ':'n' };

/** A function that takes a string and
 * returns a cleaned version of all non
 * assci characters
 * @param {*} input 
 * @returns 
 */
function cleanString(input) {
  let output = "";
  for (var i = 0; i < input.length; i++) {
    if (input.charCodeAt(i) <= 127) {
      output += input.charAt(i);
    } else {
      if( !! string_equivalent[input.charAt(i)] ){
        output += string_equivalent[input.charAt(i)];
      }else{
        output += "&#" + input.charCodeAt(i) + ";";
      }
    }
  }
  return output;
}

/** A helper function that awaits for some value to be true
 * @param {function} checker a function that returns the value.
 * @param {int} each  how often check in milliseconds 
 * @returns 
 */
async function until(checker, each=5){
  return new Promise((resolve, reject) => {
    let interval = setInterval(() => {
      if(checker()){
        clearInterval(interval);
        resolve('ended');
      }
    }, each);
  });
}

async function stop_a_moment(){
  console.log("Clean up!");
  return new Promise((resolve, reject) => {
    let interval = setTimeout(() => {
      console.log("Finished!");
        resolve('ended');
    }, 5000);
  });
}

/** Takes a file name, and parse the metadata that
 * is on the head in the form `- varname = value`
 * then determines if it must be added to the
 * post_catalog, and other actions to take on the file.
 * @param {String} file_name 
 */
async function parseFileMetaTags(file_name, callOnOver){
  try {
    const readstream = fs.createReadStream(file_name);
    const rl = readline.createInterface({
      input: readstream,
      crlfDelay: Infinity
    });
  
    let file_data = {}
    let is_file_read_over = false;
    rl.on('line', (line) => {
      // check if contains something resembling
      // to a pug var, then put it onto file_data
      if(meta_regex.test(line)){
        let temp = line.replace('-','').trim();
        let name = temp.match(/\w+/)[0];
        // data is whatever after the first equal sing
        let data = eval(temp.split('=').slice(1).join('')); 
        file_data[name] = data
      }
    });

    readstream.on('end', () => {
      addFileDataToCatalog(file_name, file_data);
      // stop read
      readstream.destroy();
      rl.close();
      rl.removeAllListeners();
      is_file_read_over = true;
    });

    await until(()=>is_file_read_over);
    callOnOver();
  } catch (err) {
    console.error(`Error parsing file ${file_name}: ${err}`);
    callOnOver();
  }
}

/**  Checks if the file data is valid to be added
 *  to the catalog of post. 
 * @param {*} file_name 
 * @param {*} file_data 
 * @returns 
 */
function addFileDataToCatalog(file_name, file_data){
  // Check our obligatory fields
  const { key, lang, title, status } = file_data;
  const required = { key, lang, title, status };
  const isValidEntry = x =>( typeof x === "string" && x.length > 0 );
  if(! Object.values(required).every( isValidEntry ) ){
    // We know there are invalid fields or empty ones
    // Determine what are the names and exit.
    let blame_lst = Object.keys(required).filter( x => !isValidEntry(required[x]) );
    let to_be = blame_lst.length == 1 ? "is" : "are";
    let to_blame = blame_lst.map( x=> `"${x}"`).join(", ");
    console.error(
      `Error on file "${file_name}": Required ${to_blame} ${to_be} not defined on pug file.`);
  }


  if( status == "publish" ){
    // add the key to the to publish list
    // so we can edit the data later.
    console.log(`File "${file_name}" status marked as publish, will be published.`);
    post_to_publish.push(key);
  }else if(  status !== 'published' ){
    if (! ["draft","hidden"].includes(status)) {
      console.error(`Error on file "${file_name}": status "${status}" is not valid.`);
    }
    return;
  }

  // now, we go for the optional fields
  const { subtitle, tags, thumbnail, description, date } = file_data;
  const url = file_name.replace(src_dir,'').replace('.pug','.html');

  post_catalog[key] = post_catalog[key] ?? {};
  post_catalog[key]["tags"] = tags ?? ["untaged"];
  post_catalog[key]["thumbnail"] = thumbnail;
  post_catalog[key]["date"] = isValidEntry(date) ? Date.parse(date) : date ; // <= this can be undefined.
  post_catalog[key]["pages"] = post_catalog[key]["pages"] ?? [];
  post_catalog[key]["pages"].push({ lang, title, subtitle, url, description });
}

/** This function takes the key of the post in
 * the catalog, that are now to be published.
 *  It adds the date of publishing at top,
 * changes their status, and renames the file as
 * `YYYY-MM-DD-Title-of-the-post.pug`
 * @param {*} key 
 */
function publishPost(key){
  let post_list = post_catalog[key]["pages"];
  let has_date = !!post_catalog[key]["date"];
  console.log(`to try publish ${key}`);
  
  let date = (new Date( Date.now() )).toISOString();
  let date_str = date.split("T")[0];
  let publish_date = date.split('T').map( x=>x.split('.')[0] ).join(' ');
  if(!has_date){
    post_catalog[key]["date"] = publish_date;
  }else{
    // check if date is a number...
    if(typeof post_catalog[key]["date"] != 'string'){
      let num_date = post_catalog[key]["date"];
      num_date =  (new Date( num_date )).toISOString();
      post_catalog[key]["date"] = num_date.split('T').map( x=>x.split('.')[0] ).join(' ');
    }
    publish_date = post_catalog[key]["date"];
    date_str = post_catalog[key]["date"].split(' ')[0];
  }

  // preprocess the directions...
  for( let post of post_list ){
    post.file_name = post.url.replace(".",src_dir);
    // Move it to a new file on the post directory
    let new_filename = `${date_str}-${post.title.toLowerCase().trim().replaceAll(/\s+/g,'-')}.pug`;
    new_filename = cleanString(new_filename);
    post.url = (`/post/${new_filename}`).replace(".pug",".html"); // relative to root
    post.new_filename = `${src_dir}/post/${new_filename}`; // relative to pug.config.js
    post.has_date = has_date;
  }

  for( let post of post_list ){
    let raw_file_data = fs.readFileSync(post.file_name).toString().split("\n");
    
    let i = 0;
    while( i<raw_file_data.length ){
      let line = raw_file_data[i];
      if( meta_regex.test(line) ){
        // add a date if there is no one before.
        if(!post.has_date){
          raw_file_data.splice(i, 0, `  - date = "${publish_date}"`);
          post.has_date = true;
          // now, we consider this part of the
          // bucle ended, and continue for the next line.
          continue;
        }

        // check the if this line contains the state and update it.
        if( status_line_regex.test(line) ){
          line = line.replace('"publish"','"published"');
          line = line.replace('"draft"','"published"');
          raw_file_data[i] = line
        }
        

      }else{
        // and because we are to move the file to a superior directory
        // we net to also edit the includes.
        if( ref_updir_line_regex.test(line) ){
          line = line.replaceAll('../..','..');
        }
        // we also trasform the lines  `word` => #[span.code word] 
        for(let [word] of line.matchAll(backticks_closed_words)){
          let clean_word = word.replaceAll("\`",'');
          line = line.replaceAll(word,`#[span.code ${clean_word}]`);
        }
        for(let [word] of line.matchAll(markdown_is_bold_and_italic)){
          let clean_word = word.replaceAll("*",'');
          line = line.replaceAll(word,` #[b #[i ${clean_word} ] ]`);
        }
        for(let [word] of line.matchAll(markdown_is_just_bold)){
          let clean_word = word.replaceAll("*",'');
          line = line.replaceAll(word,` #[b ${clean_word} ]`);
        }
        for(let [word] of line.matchAll(markdown_is_just_italic)){
          let clean_word = word.replaceAll("*",'');
          line = line.replaceAll(word,` #[i ${clean_word} ]`);
        }
        raw_file_data[i] = line;
      }
      i++;
    }
    // now, to the end of the file we add the url of the
    // other post on diferent idioms, used for the navbar to
    // know were to go if the idiom changes.
    for( let other_post of post_list ){
      if( other_post.lang != post.lang ){
        let lang = other_post.lang;
        let url = other_post.url;
        raw_file_data.push(`  .key.idiom( lang="${lang}" value="${url}" aria-hidden="true")`);
      }
    }
    let file_name = post.file_name;
    // delete the draft
    fs.unlink(file_name, (err) => { if (err) return console.log(err);  });
    
    text = raw_file_data.join("\n");
    fs.writeFile(post.new_filename, text, function (err) {
      if (err) {
        return console.log(err)
      };
      console.log(`Draft "${post.file_name.split('/').pop()}" published as "${post.new_filename.split('/').pop()}"`);
      delete post.new_filename;
      delete post.has_date;
      delete post.file_name;
    });
  }

  post_to_publish = post_to_publish.filter( x=> x!=key); // remove the key
}


/** Gets all the pug files in the path recursively.
 * @param {*} path the path where files are stored.
 * @returns a list with all the pats to .pug files.
 */
function getAllPugFiles(path) {
  let files = fs.readdirSync(path)
  let list_of_files = [];
  files.forEach( file => {
    let full_path = `${path}/${file}`;
    if (fs.statSync(full_path).isDirectory()) {
      list_of_files = [ ...list_of_files, ...getAllPugFiles(full_path)];
    } else {
      /// only add the files that end in .pug
      /// and not are list.pug.
      if( dotpug_regex.test(full_path)
          && !list_pug_regex.test(full_path)){ 
        list_of_files.push(full_path);
      }
    }
  });
  return list_of_files
}

/** This function save to a file the catalog.
 * Is a js becuase a json can not handle the sintax required
 * to keep track of the thumbnails url.
 * @param {*} post_directory
 * @param {*} post_catalog
 */
function writeCatalogJS(post_directory, post_catalog) {
  console.log(JSON.stringify(post_catalog,null,2));
  const list_post = Object.values(post_catalog).sort((a,b)=>b.date - a.date);
  
  let objet_string =  JSON.stringify(list_post, (key,value)=>{
    if (key === 'thumbnail') {
      return `new URL('../${value}', import.meta.url)`;
    }
    return value;
  },1);
  const imagen_rgx = /"thumbnail".+",/gm;
  const thumbnails = [...objet_string.matchAll(imagen_rgx)].map(x=>x[0]);
  thumbnails.forEach( tumb=>{
      console.log(tumb);
      let s1 =tumb.replaceAll('"','').replace('thumbnails','"thumbnails"');
      console.log(s1);
      objet_string = objet_string.replace(tumb,s1);
  } )
  objet_string = `/** This is an automaticaly build file*/\nexport const catalog = ${objet_string};`;

  // save the catalog file, and we are done.
  fs.writeFile(`${post_directory}/catalog.js`,objet_string, err => {
    if (err) {
      console.error(err);
    }else{
      console.log("All post files processed");
    }
  });
}

/** Reads all the .pug post in the src_dir/post
 * directory. Then generates a catalog.json that
 * contains info of the post, and realizes other
 * actions on the files.
 */
async function processPost(){

  const src_post = `${src_dir}/post`;

  let file_list = getAllPugFiles(src_post);
  // check if there are even files to be read in first place.
  let no_more_files_to_add = file_list.length == 0;
  let files_remaining_to_parse = file_list.length;
  let aFileLessToParse = ()=>{files_remaining_to_parse-=1;}

  file_list.forEach( (file, index) =>{
    parseFileMetaTags( file, aFileLessToParse );
    no_more_files_to_add = index == file_list.length-1;
  });
  
  // for some reason when building with parcel, it continues
  // even before the first file is added, this line avoids it.
  await until(()=>(no_more_files_to_add)); 
  
  await until(()=>(files_remaining_to_parse==0));

  // edit all the files that need to be published
  post_to_publish.forEach( key=> publishPost(key) );
  await until(()=>(post_to_publish.length==0));

  writeCatalogJS(src_post, post_catalog);
}


processPost();