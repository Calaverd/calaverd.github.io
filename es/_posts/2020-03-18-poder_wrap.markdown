---
layout: post
title:  "El poder del 'Image Wraping'"
date:   2020-03-18 21:15
lang: "es"
categories: love2d tutorial
tpar: "d20200318l"
---

Una de las ventajas de Löve 2d es que al estar construido sobre OpenGl, permite manejar las imágenes como texturas, pudiendo repetirlas indefinidamente en un área especificada, estirándolas para envolver (*wrap*) a lo largo y ancho de ese espacio.

![](/assets/t_wrap/wrap.gif){: .center-image }

<h3>Entendiendo los modos del *wrap*</h3>

Los diferentes modos del *wrap* pueden ser aplicados a la imagen, ya sea solo horizontal, vertical, o en ambos.
* <h4>`clampzero`</h4>

> Este modo le indica de forma explicita a la imagen que esta no puede extenderse para cubrir el área.

![](/assets/t_wrap/ima1.png){: .center-image }

* <h4>`clamp`</h4>

> Extiende el color del ultimo píxel de borde hasta cubrir el área.

![](/assets/t_wrap/clamp.png){: .center-image }
(clamp,clampzero) || (clampzero,clamp) || (clamp,clamp)

* <h4>`repeat`</h4> 

> Repite la imagen las veces que sean necesarias para cubrir el área.

![](/assets/t_wrap/repeat.png){: .center-image }
(repeat,clampzero) || (clampzero,repeat) || (repeat,repeat)

* <h4>`mirroredrepeat`</h4>

> Repite la imagen reflejandola sobre si misma para cubrir el área.

![](/assets/t_wrap/mirroredrepeat.png){: .center-image }
(mirroredrepeat,clampzero) || (clampzero,mirroredrepeat) || (mirroredrepeat,mirroredrepeat)

Pueden aplicarse a la imagen diferentes modos de wrap al mismo tiempo, por ejemplo, aquí el horizontal es `mirroredrepeat` y el vertical `clamp`.

![](/assets/t_wrap/mix.png){: .center-image }

<h3>Usando el *wrap*</h3>

Utilizar el *wrap* es tan sencillo como simplemente crear un objeto de tipo `Image` y llamar a su método `setWrap`.

{% highlight lua %}
self.image = love.graphics.newImage('ima1png') --imagen de 32x32
self.image:setFilter('nearest','nearest') --Para mantener la imagen nitida si la escalamos
self.image:setWrap(horizontal_wrap,vertical_wrap)
{% endhighlight %}

Después en crear un `quad` de dimensiones mayores. [^1]

{% highlight lua %}
quad = love.graphics.newQuad(
    -48, -48, -- punto de inicio (x,y)
    128, 128, -- tamaño del quad
     32,  32  -- tamaño de la imagen
     )
{% endhighlight %}

Solo resta dibujar la imagen utilizando el `quad`:

{% highlight lua %}
love.graphics.setColor(1,1,1)
love.graphics.draw(image,quad,x,y)
{% endhighlight %}

Puedes descargar el archivo que contine el codigo [completo aquí.](/assets/t_wrap/wrap.zip)

<h3>Trabajando con Mapas de tiles y similares</h3>

![](/assets/t_wrap/Overworld.png){: .center-image }

La principal desventaja de utilizar este método, radica en el hecho de que debes crear una imagen separada por cada `quad`, esta no puede venir en un atlas de texturas, un *sprite sheet*, o mapa de tiles, puesto que solo puedes usar un `quad` para "recortar" un pedazo de la imagen, o como un área a cubrir, ninguna de las dos cosas al mismo tiempo.

Una solución alterna para no tener que separar las imágenes, seria el cargar a la memoria el atlas, *sprite sheet* o mapa de tiles, como un `ImageData` y utilizar su método `paste` para crear una nueva imagen del pedazo que quieres. Solo recuerda que crear una imagen a partir de la `ImageData` de otra puede ser más lento dependiendo del tamaño.

{% highlight lua %}
tilemap = love.image.newImageData('Overworld.png')
tile_data = love.image.newImageData(16,16) --crea un tile de 16x16

tile_data:paste(
    tilemap, -- Dibuja desde esta imagen data
    0,0,     -- A esta otra imagen data  a partir de este punto
    80,160,  -- Un pedazo que inicia desde aquí
    16,16    -- Que es de 16 píxeles de alto y ancho.
    )
    
tile_image = love.graphics.newImage(tile_data)
{% endhighlight %}

Después de eso, puedes ya aplicarle mismo procedimiento que arriba.

{% highlight lua %}
tile_image:setFilter('nearest','nearest')
tile_image:setWrap(horizontal_wrap,vertical_wrap) 
{% endhighlight %}

{% highlight lua %}
love.graphics.setColor(1,1,1)
love.graphics.draw(tile_image,quad,x,y)
{% endhighlight %}

![](/assets/t_wrap/wrap_tile.gif){: .center-image }


Puedes descargar el código modificado [justo aquí.](/assets/t_wrap/wrap_tile.zip)

[^1]:Se usa 48 por que es el la mitad del tamaño del quad (128/2 = 64), menos  la mitad del tamaño de la imagen (32/2 = 16), esto para tener la imagen al centro del quad.
