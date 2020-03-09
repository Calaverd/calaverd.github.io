---
layout: post
title:  "¡Bienvenido a Jekyll!"
date:   2020-03-08 20:19:33 
lang: "es"
categories: jekyll update
tpar: "d20200308l"
---

encontraras este post en  `es/_posts`.

`YEAR-MONTH-DAY-title.MARKUP`

{% highlight lua %}
function Hola()
    print("Hola mundo "..tostring(1010))
end
--este es un comentario
{% endhighlight %}

Check out the [Jekyll docs][jekyll-docs] for more info on how to get the most out of Jekyll. File all bugs/feature requests at [Jekyll’s GitHub repo][jekyll-gh]. If you have questions, you can ask them on [Jekyll Talk][jekyll-talk].

[jekyll-docs]: https://jekyllrb.com/docs/home
[jekyll-gh]:   https://github.com/jekyll/jekyll
[jekyll-talk]: https://talk.jekyllrb.com/

<div align="center">________________________________________</div>
<div class="lang" align="center">
    {% for post in site.posts %}
        {% if post.tpar == "d20200308l" %}
            {% if page.lang != post.lang and page.lang == "en" %}
                <a class="{{ post.lang }}" href="{{ post.url }}">Este árticulo esta en español</a>
            {% endif %}
            {% if page.lang != post.lang and page.lang == "es" %}
                <a class="{{ post.lang }}" href="{{ post.url }}">This post is also in English</a>
            {% endif %}
        {% endif %}
    {% endfor %}
</div>
<div align="center">________________________________________</div>
