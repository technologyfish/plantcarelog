<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Plant extends Model
{
    protected $fillable = [
        'user_id',
        'category_id',
        'name',
        'scientific_name',
        'image',
        'description',
        'plant_date',
        'care_cycle',
        'difficulty',
        'light',
        'temperature',
        'humidity',
        'tags',
    ];

    protected $casts = [
        'tags' => 'array',
        'plant_date' => 'date',
    ];

    /**
     * 植物所属用户
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * 植物所属分类
     */
    public function category()
    {
        return $this->belongsTo(PlantCategory::class, 'category_id');
    }

    /**
     * 植物的养护记录
     */
    public function careRecords()
    {
        return $this->hasMany(CareRecord::class);
    }

    /**
     * 植物的照片
     */
    public function photos()
    {
        return $this->hasMany(PlantPhoto::class);
    }

    /**
     * 获取陪伴天数
     */
    public function getDaysAttribute()
    {
        if (!$this->plant_date) {
            return 0;
        }
        return Carbon::parse($this->plant_date)->diffInDays(Carbon::now());
    }

    /**
     * 是否需要浇水
     */
    public function getNeedWaterAttribute()
    {
        $lastWater = $this->careRecords()
            ->where('type', 'water')
            ->orderBy('care_date', 'desc')
            ->first();

        if (!$lastWater) {
            return true;
        }

        $daysSinceLastWater = Carbon::parse($lastWater->care_date)->diffInDays(Carbon::now());
        return $daysSinceLastWater >= $this->care_cycle;
    }

    /**
     * 获取分类名称
     */
    public function getCategoryNameAttribute()
    {
        return $this->category ? $this->category->name : '未分类';
    }

    /**
     * 获取最后养护时间
     */
    public function getLastCareAttribute()
    {
        $lastRecord = $this->careRecords()->orderBy('care_date', 'desc')->first();
        if (!$lastRecord) {
            return '暂无记录';
        }
        $days = Carbon::parse($lastRecord->care_date)->diffInDays(Carbon::now());
        return $days == 0 ? '今天' : $days . '天前';
    }

    /**
     * 获取养护次数
     */
    public function getCareCountAttribute()
    {
        return $this->careRecords()->count();
    }

    protected $appends = ['days', 'need_water', 'category_name', 'last_care', 'care_count'];
}
