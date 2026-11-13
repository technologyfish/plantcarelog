<?php

namespace App\Models;

use Illuminate\Auth\Authenticatable;
use Illuminate\Contracts\Auth\Access\Authorizable as AuthorizableContract;
use Illuminate\Contracts\Auth\Authenticatable as AuthenticatableContract;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Laravel\Lumen\Auth\Authorizable;

class User extends Model implements AuthenticatableContract, AuthorizableContract
{
    use Authenticatable, Authorizable, HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var string[]
     */
    protected $fillable = [
        'openid',
        'nickname',
        'avatar',
        'signature',
    ];

    /**
     * The attributes excluded from the model's JSON form.
     *
     * @var string[]
     */
    protected $hidden = [
        'openid',
    ];

    /**
     * 用户的植物
     */
    public function plants()
    {
        return $this->hasMany(Plant::class);
    }

    /**
     * 用户的分类
     */
    public function categories()
    {
        return $this->hasMany(PlantCategory::class);
    }

    /**
     * 用户的养护记录
     */
    public function careRecords()
    {
        return $this->hasMany(CareRecord::class);
    }
}
