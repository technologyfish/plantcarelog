<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PlantCategory extends Model
{
    protected $fillable = [
        'user_id',
        'name',
        'icon',
        'sort_order',
    ];

    /**
     * 分类所属用户
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * 分类下的植物
     */
    public function plants()
    {
        return $this->hasMany(Plant::class, 'category_id');
    }

    /**
     * 获取分类下植物数量
     */
    public function getPlantCountAttribute()
    {
        return $this->plants()->count();
    }

    protected $appends = ['plant_count'];
}
