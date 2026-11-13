<?php

// 屏蔽 PHP 8.4 对旧版框架代码的 Deprecated 警告，避免干扰 HTTP 响应
error_reporting(E_ALL & ~E_DEPRECATED & ~E_WARNING);

/*
|--------------------------------------------------------------------------
| Create The Application
|--------------------------------------------------------------------------
|
| First we need to get an application instance. This creates an instance
| of the application / container and bootstraps the application so it
| is ready to receive HTTP / Console requests from the environment.
|
*/

// 屏蔽 PHP 8.4 对旧版框架代码的 Deprecated 警告，避免干扰 HTTP 响应
// （Lumen 构造时会 error_reporting(-1)，必须在应用创建后再设置）
$app = require __DIR__.'/../bootstrap/app.php';
error_reporting(E_ALL & ~E_DEPRECATED & ~E_WARNING);

/*
|--------------------------------------------------------------------------
| Run The Application
|--------------------------------------------------------------------------
|
| Once we have the application, we can handle the incoming request
| through the kernel, and send the associated response back to
| the client's browser allowing them to enjoy the creative
| and wonderful application we have prepared for them.
|
*/

$app->run();
