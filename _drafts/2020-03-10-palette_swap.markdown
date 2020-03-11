---
layout: post
title:  "Cambio de paleta en Löve, sin usar shaders"
date:   2020-03-10 20:19:33 
lang: "es"
categories: jekyll update
tpar: "d20200310l"
---

Cambiar el color de una imagen puede ser una forma muy útil de reutilizar un recurso sin aumentar el tamaño en disco del juego.
Es posible cambiar el color de las imágenes utilizando las capacidades de `ImageData` para acceder a los píxeles directamente, ya sea para leer los colores como para cambiarlos.

El algoritmo consiste en cargar a la memoria nuestra imagen como un objeto de tipo  `ImageData`, en el cual no haremos cambios y solo vamos a usar como un *"mapa"* para saber que color se supone que debemos utilizar, por eso lo llamaremos `image_map`. También creamos una imagen de las mismas dimensiones donde vamos a escribir todos los cambios que hagamos, a esta la llamaremos `image_data`[^1].

![](/assets/t_palette_swap/ima.png){: .center-image }

Hay que cargar una imagen que contiene las paletas a utilizar, que sera `palette_data`, donde cada franja horizontal de un píxel de alto es una paleta:

![](/assets/t_palette_swap/palette.png){: .center-image }

{% highlight lua %}
image_map = love.image.newImageData('ima.png')
image_data = love.image.newImageData( image_map:getWidth(), image_map:getHeight())
palette_data = love.image.newImageData('palette.png')
{% endhighlight %}


También debemos calcular el numero máximo de paletas (`max_palettes`) que podemos utilizar, este sera igual al tamaño vertical de la imagen donde guardamos las paletas. 

{% highlight lua %}
max_palettes = palette_data:getHeight()
{% endhighlight %}


Ahora creamos una tabla donde veremos a que cada columna de la primera fila de imagen de paletas se corresponde cada color que compone la primera paleta. A esta tabla la llamaremos `look_up_color_table`. Crearemos una cadena que nos servirá de `id` para identificar a cada color rápidamente.

{% highlight lua %}
look_up_color_table = {}
local col = palette_data:getWidth()
local i = 0
while i < col do
    local r,g,b,a = palette_data:getPixel(i,0)
    --El id es creado usando un valor similar al hexadecimal
    local id = ("%X_%X_%X_%X"):format(math.floor((r)*255),math.floor((g)*255), math.floor((b)*255),math.floor((a)*255))  
    look_up_color_table[id] = i
    i=i+1
end
{% endhighlight %}

Fijamos la paleta que queremos usar y cambiamos los colores de `image_data`.

{% highlight lua %}
use_palette = 1
changePalete()
{% endhighlight %}

Lo que ocurre dentro de la función `changePalete()`, es que llamamos al método `mapPixel()` del objeto `ImageData`. `mapPixel()` nos permite mandar una función que se ejecutara por cada uno de los píxeles que componen el objeto, en este caso, la función con la cual cambiamos los colores.
Después, como los objetos de tipo `ImageData` no pueden ser dibujados creamos una imagen para poder dibujar en pantalla, y le decimos que queremos que se dibuje nítida.

{% highlight lua %}
function changePalete()
    image_data:mapPixel(changeColors)
    image = love.graphics.newImage(image_data)
    image:setFilter('nearest','nearest')
end
{% endhighlight %}

Ahora, es en la función `changeColors()` donde ocurre todo.

![](/assets/t_palette_swap/algoritmo.png){: .center-image }

Primero recibimos las coordenadas *(x,y)* del color que queremos cambiar, buscamos que color es en `image_map` con el método `getPixel(x,y)`, después transformamos ese color a un `id`, con el cual accedemos a la tabla `look_up_color_table`, que nos regresa un numero de columna. Con el numero de `use_palette` que es igual al numero de la fila, y ya sabiendo la columna, tomamos ese color de nuestra paleta, y lo regresamos para colocado en las coordenadas *(x,y)* en `image_data`

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

Por cada vez que cambiemos la paleta de la imagen, solo necesitamos establecer cuál es la fila correspondiente y cambiarla.

{% highlight lua %}
use_palette = 3 
changePalete()
{% endhighlight %}


Ojo, una desventaja de este método sin sombreadores, es el hecho de que cambian las paletas, ** cuanto más grande sea el área a cambiar, esto será más lento de manera exponencial **

Eso seria todo, puedes descargar el archivo ***.love*** [justo aquí](/assets/t_palette_swap/palette_swap.love) y revisarlo por ti mismo. Puedes usar las flechas para cambiar entre paletas.

[^1]: Cuando creamos un objeto `ImageData` usando `love.image.newImageData()`, todos los valores RGBA de los píxeles son *(0,0,0,0)* 
