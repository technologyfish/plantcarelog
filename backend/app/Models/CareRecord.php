<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CareRecord extends Model
{
    protected $fillable = [
        'user_id',
        'plant_id',
        'type',
        'amount',
        'care_date',
        'care_time',
        'note',
        'status',
    ];

    // 不做 date cast，避免时区序列化偏移，前端直接拿 'YYYY-MM-DD' 原始字符串

    /**
     * 记录所属用户
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * 记录所属植物
     */
    public function plant()
    {
        return $this->belongsTo(Plant::class);
    }

    /**
     * 获取植物名称
     */
    public function getPlantNameAttribute()
    {
        return $this->plant ? $this->plant->name : '';
    }

    /**
     * 获取植物图片
     */
    public function getPlantImageAttribute()
    {
        return $this->plant ? $this->plant->image : '';
    }

    protected $appends = ['plant_name', 'plant_image'];
}
