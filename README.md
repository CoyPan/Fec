# FEC

> front error collector

### Usage

1. 为了保证能收集到所有错误，暂时只支持使用```<script>```的方式引用。或者直接内联写在script中。在页面加载其他js文件之前引入Fec。

```html
<html>
    <head>
        ...
        <script src='http://xxxxxxx/fec.js'></script>
        ...
    </head>
    <body>
        ...
    </body>
</html>
```


2. 基本用法：

```javascript

     function errorCb(e){
            console.log('出错了---start----');
            console.log(e);
            console.log('出错了---end----');
        }

    var fecIntance = new Fec({
        onError: errorCb
    });
    fecIntance.init();

```