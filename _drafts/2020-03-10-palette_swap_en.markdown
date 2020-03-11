---
layout: post
title:  "Palette swap on Löve, without use shaders"
date:   2020-03-10 20:19:33 
lang: "en"
categories: jekyll update
tpar: "d20200310l"
---

Changing the color of a image can be a very usefull form to reuse an asset without rise the file size of the game on disk. Is posible change the color of the images using the capaciti of `ImageData` to acces directly the pixels, to both, read the colors, as to modify they.

The algorithm is based on load to the memory our image as an objet of type `ImageData`, in which we will do not any changes and only use as a *" map "* to know what is the color to be used, for that reason we gonna call it `image_map`. We also make an image of the same size where we will write all the changes to be made, and call it `image_data` [^1].

![](/assets/t_palette_swap/ima.png){: .center-image }

There has to be load an image that contains the palettes to be used, the `palette_data`, where each row of pixels is a palette.

![](/assets/t_palette_swap/palette.png){: .center-image }

{% highlight lua %}
image_map = love.image.newImageData('ima.png')
image_data = love.image.newImageData( image_map:getWidth(), image_map:getHeight())
palette_data = love.image.newImageData('palette.png')
{% endhighlight %}

We also must calculate the max number of palettes that we can use (`max_palettes`), that will be of the same height as the image were are stored the palettes.

{% highlight lua %}
max_palettes = palette_data:getHeight()
{% endhighlight %}

Now we create a new table to be used as look up where each column of the first row of the palette image corresponds to each color of the first palette. This table will be called `look_up_color_table`. We also gonna make a string that will be used as an `id` to identify each color quickly.

{% highlight lua %}
look_up_color_table = {}
local col = palette_data:getWidth()
local i = 0
while i <> col do
    local r,g,b,a = palette_data:getPixel(i,0)
    --the id is created using a hex like value
    local id = ("%X_%X_%X_%X"):format(math.floor((r)*255),math.floor((g)*255), math.floor((b)*255),math.floor((a)*255))  
    look_up_color_table[id] = i
    i=i+1
end
{% endhighlight %}

We fixed the palette to be used and change the colors on `image_data`.

{% highlight lua %}
use_palette = 1
changePalete()
{% endhighlight %}

What happens inside of the function `changePalete()`, the metod `mapPixel()` of the objet `ImageData` is called. `mapPixel()` allow us to send a function that will be run for each one of the pixels on the objet, in this case, the very function that actually change the colors. 
After, as objects of type `ImageData` can not be draw, we should create a image object to draw on screen, and we set the filter to "nearest".

{% highlight lua %}
function changePalete()
    image_data:mapPixel(changeColors)
    image = love.graphics.newImage(image_data)
    image:setFilter('nearest','nearest')
end
{% endhighlight %}

Now, in the function `changeColors()` happens everything. 

![](/assets/t_palette_swap/algoritmo.png){: .center-image }

We first take the coords *(x,y)* of the color to be change, we search the color on the `image_map` using the metod `getPixel(x,y)`, after we transform the color to an `id`, and use it to access to the table `look_up_color_table`, that returns the column number. An then, using `use_palette`, that is equal to the number of the row, and now knowing also the column, we take the color of the palete and place it in the coords *(x,y)* on `image_data`.

{% highlight lua %}
function changeColors(x, y, r,g,b,a)
    local o_r,o_g,o_b,o_a = image_map:getPixel(x,y)
    local id = ("%X_%X_%X_%X"):format(math.floor((o_r)*255),math.floor((o_g)*255), math.floor((o_b)*255),math.floor((o_a)*255))
    --check if the color exist on the table
    if look_up_color_table[id] then
        --if exist, then get the color on the palete 
        local col = look_up_color_table[id]
        local row = use_palette-1
        return palette_data:getPixel(col,row)
    end
    --else, do nothing, return the original color
    return r, g, b, a
end
{% endhighlight %}

For every time we what to change the palette of the image, we only need to set what is the corresponding row, and change it.

{% highlight lua %}
use_palette = 3 
changePalete()
{% endhighlight %}

Watch out, a disadvantage of this method without shaders, is on the fact that change the palettes, **the bigger the area to change, this will be slower on a exponential manner**

That will be everything, you can download the ***.love*** file [right here](/assets/t_palette_swap/palette_swap.love) and check it for yourself. Use the arrow keys to change between palletes.

[^1]: When an `ImageData` object is created using `love.image.newImageData()`, all the RGBA values of the pixels are *(0,0,0,0)* 


