<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PlantPhoto extends Model
{
    protected $fillable = [
        'plant_id',
        'url',
        'photo_date',
        'note',
    ];

    // 不做 date cast，避免时区序列化偏移，前端直接拿 'YYYY-MM-DD' 原始字符串

    /**
     * 照片所属植物
     */
    public function plant()
    {
        return $this->belongsTo(Plant::class);
    }
}
