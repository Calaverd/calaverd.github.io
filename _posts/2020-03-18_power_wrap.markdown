---
layout: post
title:  "The power of image wrap"
date:   2020-03-18 09:00
lang: "en"
categories: love2d tutorial
tpar: "d20200318l"
---

One of the advantages of  Löve 2d is that being built on top of OpenGl allow us to handle the images as textures, enable us to repeat indefinitely on a specific area, to wrap to the wide and long of that space.

![](/assets/t_wrap/wrap.gif){: .center-image }

<h3>Understanding the wrap modes</h3>

The different modes of wrap can be applied to a image, in an horizontal, vertical or both.

* <h4>`clampzero`</h4>

> In this mode, is made clear for the image that it can not wrap to cover the area.

![](/assets/t_wrap/ima1.png){: .center-image }

* <h4>`clamp`</h4>

> Wrap using the color of the image border pixel.

![](/assets/t_wrap/clamp.png){: .center-image }
(clamp,clampzero) || (clampzero,clamp) || (clamp,clamp)

* <h4>`repeat`</h4> 

> Repeat the image many times as needed to cover the area.

![](/assets/t_wrap/repeat.png){: .center-image }
(repeat,clampzero) || (clampzero,repeat) || (repeat,repeat)

* <h4>`mirroredrepeat`</h4>

> Repeat the image mirroring itself to cover the area.

![](/assets/t_wrap/mirroredrepeat.png){: .center-image }
(mirroredrepeat,clampzero) || (clampzero,mirroredrepeat) || (mirroredrepeat,mirroredrepeat)

Can be used different modes of wrap to the same time, for example, here the horizontal is `mirroredrepeat` and the vertical is `clamp`.

![](/assets/t_wrap/mix.png){: .center-image }

<h3>Using the wrap</h3>

Using the wrap is as simple as creating an `Image` and calling their method `setWrap`.

{% highlight lua %}
self.image = love.graphics.newImage('ima1png') --an image of 32x32
self.image:setFilter('nearest','nearest') --Keep the image crisp to rescale
self.image:setWrap(horizontal_wrap,vertical_wrap)
{% endhighlight %}

After that, make a `quad` of bigger dimensions. [^1]

{% highlight lua %}
quad = love.graphics.newQuad(
    -48, -48, -- start (x,y)
    128, 128, -- quad size
     32,  32  -- size of the image
     )
{% endhighlight %}

The only thing left to do, is to draw the image using the `quad`:

{% highlight lua %}
love.graphics.setColor(1,1,1)
love.graphics.draw(image,quad,x,y)
{% endhighlight %}


You can download the *.zip* file with the full [code here.](/assets/t_wrap/wrap.zip)

<h3>Working with tilemaps and alikes</h3>

![](/assets/t_wrap/Overworld.png){: .center-image }

The main disadvantage of using this method is on the fact that you should make another picture for each `quad`, this can not be part of a texture atlas, a sprite sheet, or a tilemap, that beacause you only can use a `quad` to cut a chunk of an image, or as an area to wrap, neither both.

A workaround to not having to cut the images beforehand, is to load to the memory the texture atlas, a sprite sheet, or a tilemap, using `ImageData` and their method `paste` to create a new image from the desired chunk. Only remember, that creating a image in this way can be slow depending of the image size.

{% highlight lua %}
tilemap = love.image.newImageData('Overworld.png')
tile_data = love.image.newImageData(16,16) --make a tile of 16x16

tile_data:paste(
    tilemap, -- Draw form this image data
    0,0,     -- To this other image data starting here
    80,160,  -- A chunk on this place
    16,16    -- That is 16 pixels tall by long.
    )
    
tile_image = love.graphics.newImage(tile_data)
{% endhighlight %}

After that, you can do the same that before. 

{% highlight lua %}
tile_image:setFilter('nearest','nearest')
tile_image:setWrap(horizontal_wrap,vertical_wrap) 
{% endhighlight %}

{% highlight lua %}
love.graphics.setColor(1,1,1)
love.graphics.draw(tile_image,quad,x,y)
{% endhighlight %}

![](/assets/t_wrap/wrap_tile.gif){: .center-image }


You can download the adjusted source code [right here.](/assets/t_wrap/wrap_tile.zip)

[^1]:We use 48 because is half the quad size, (128/2 = 64), minus half the size of the image (32/2 = 16), This to center it inside the quad.
