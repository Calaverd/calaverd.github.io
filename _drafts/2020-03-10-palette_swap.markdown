---
layout: post
title:  "Cambio de paleta en Löve, sin usar shaders"
date:   2020-03-10 20:19:33 
lang: "es"
categories: jekyll update
tpar: "d20200310l"
---

Cambiar el color de una imagen puede ser una forma muy util de reeutilizar un recurso sin aumentar el tamaño en disco del juego.
Es posible cambiar el color de las imagenes utilizando las capacidades de `ImageData` para acceder a los pixeles directamente, ya sea para leer los colores como para cambiarlos.

El algoritmo 
![Algotirmo](/assets/t_palette_swap/algoritmo.png)

{% highlight lua %}
def print_hi(name)
  puts "Hi, #{name}"
end
print_hi('Tom')
#=> prints 'Hi, Tom' to STDOUT.
{% endhighlight %}


