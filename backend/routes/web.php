<?php

/** @var \Laravel\Lumen\Routing\Router $router */

/*
|--------------------------------------------------------------------------
| Application Routes
|--------------------------------------------------------------------------
|
| Here is where you can register all of the routes for an application.
| It is a breeze. Simply tell Lumen the URIs it should respond to
| and give it the Closure to call when that URI is requested.
|
*/

$router->get('/', function () use ($router) {
    return $router->app->version();
});

// API 路由组
$router->group(['prefix' => 'api'], function () use ($router) {
    
    // 用户相关
    $router->get('/user/profile', 'UserController@profile');
    $router->put('/user/profile', 'UserController@updateProfile');

    // 用户管理（管理后台）
    $router->get('/users', 'UserController@index');
    $router->post('/users', 'UserController@store');
    $router->put('/users/{id}', 'UserController@update');
    $router->delete('/users/{id}', 'UserController@destroy');
    
    // 植物相关
    $router->get('/plants', 'PlantController@index');
    $router->post('/plants', 'PlantController@store');
    $router->get('/plants/{id}', 'PlantController@show');
    $router->put('/plants/{id}', 'PlantController@update');
    $router->delete('/plants/{id}', 'PlantController@destroy');
    $router->get('/plants/{id}/care-records', 'PlantController@careRecords');
    $router->get('/plants/{id}/photos', 'PlantController@photos');
    
    // 分类相关
    $router->get('/categories', 'CategoryController@index');
    $router->post('/categories', 'CategoryController@store');
    $router->put('/categories/{id}', 'CategoryController@update');
    $router->delete('/categories/{id}', 'CategoryController@destroy');
    
    // 养护记录相关
    $router->get('/care-records', 'CareRecordController@index');
    $router->post('/care-records', 'CareRecordController@store');
    $router->put('/care-records/{id}', 'CareRecordController@update');
    $router->delete('/care-records/{id}', 'CareRecordController@destroy');
    
    // 日志
    $router->get('/logs', 'CareRecordController@logs');
    
    // 文件上传
    $router->post('/upload', 'UploadController@upload');

    // 植物照片（批量添加）
    $router->post('/plants/{id}/photos', 'PlantController@addPhotos');
});
