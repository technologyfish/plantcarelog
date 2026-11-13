<?php

namespace App\Http\Controllers;

use App\Models\Plant;
use Illuminate\Http\Request;

class PlantController extends Controller
{
    /**
     * 获取植物列表
     * user_id 参数：缺省=1（小程序兼容）、'all'=全部用户、数字=指定用户
     */
    public function index(Request $request)
    {
        try {
            $userId = $request->input('user_id', 1);

            $query = Plant::query()->with('category')->with('user');

            if ($userId !== 'all') {
                $query->where('user_id', (int)$userId);
            }

            if ($request->has('category_id') && $request->category_id !== '') {
                $query->where('category_id', $request->category_id);
            }

            if ($request->has('search') && $request->search !== '') {
                $query->where('name', 'like', '%' . $request->search . '%');
            }

            $plants = $query->orderBy('created_at', 'desc')->get();

            return response()->json([
                'code' => 200,
                'message' => 'success',
                'data' => $plants
            ]);
        } catch (\Exception $e) {
            // 数据库不可用时返回模拟数据
            return response()->json([
                'code' => 200,
                'message' => 'success (mock data)',
                'data' => [
                    [
                        'id' => 1,
                        'name' => '波士顿蕨',
                        'image' => 'https://picsum.photos/200/200?random=1',
                        'category_id' => 1,
                        'category_name' => '室内植物',
                        'days' => 16,
                        'need_water' => true,
                        'last_care' => '3天前',
                        'care_count' => 5
                    ],
                    [
                        'id' => 2,
                        'name' => '幸福树',
                        'image' => 'https://picsum.photos/200/200?random=2',
                        'category_id' => 1,
                        'category_name' => '室内植物',
                        'days' => 12,
                        'need_water' => false,
                        'last_care' => '1天前',
                        'care_count' => 3
                    ]
                ]
            ]);
        }
    }

    /**
     * 创建植物
     */
    public function store(Request $request)
    {
        $this->validate($request, [
            'name' => 'required|string|max:100',
            'category_id' => 'nullable|integer',
            'image' => 'nullable|string',
            'plant_date' => 'nullable|date',
            'care_cycle' => 'nullable|integer|min:1',
            'description' => 'nullable|string',
        ]);

        // user_id：缺省=1（小程序兼容），管理后台可指定归属用户
        $userId = (int)($request->input('user_id') ?: 1);

        $plant = Plant::create([
            'user_id' => $userId,
            'name' => $request->name,
            'category_id' => $request->category_id,
            'image' => $request->image,
            'plant_date' => $request->plant_date,
            'care_cycle' => $request->care_cycle ?? 7,
            'description' => $request->description,
        ]);

        return response()->json([
            'code' => 200,
            'message' => '添加成功',
            'data' => $plant
        ]);
    }

    /**
     * 获取植物详情
     */
    public function show($id)
    {
        $plant = Plant::with(['category', 'careRecords', 'photos'])->find($id);

        if (!$plant) {
            return response()->json([
                'code' => 404,
                'message' => '植物不存在',
                'data' => null
            ], 404);
        }

        return response()->json([
            'code' => 200,
            'message' => 'success',
            'data' => $plant
        ]);
    }

    /**
     * 更新植物
     */
    public function update(Request $request, $id)
    {
        $plant = Plant::find($id);

        if (!$plant) {
            return response()->json([
                'code' => 404,
                'message' => '植物不存在',
                'data' => null
            ], 404);
        }

        $plant->update($request->only([
            'name', 'category_id', 'image', 'description', 
            'plant_date', 'care_cycle', 'scientific_name',
            'difficulty', 'light', 'temperature', 'humidity', 'tags'
        ]));

        return response()->json([
            'code' => 200,
            'message' => '更新成功',
            'data' => $plant
        ]);
    }

    /**
     * 删除植物
     */
    public function destroy($id)
    {
        $plant = Plant::find($id);

        if (!$plant) {
            return response()->json([
                'code' => 404,
                'message' => '植物不存在',
                'data' => null
            ], 404);
        }

        $plant->delete();

        return response()->json([
            'code' => 200,
            'message' => '删除成功',
            'data' => null
        ]);
    }

    /**
     * 获取植物的养护记录
     */
    public function careRecords($id)
    {
        $plant = Plant::find($id);

        if (!$plant) {
            return response()->json([
                'code' => 404,
                'message' => '植物不存在',
                'data' => null
            ], 404);
        }

        $records = $plant->careRecords()->orderBy('care_date', 'desc')->get();

        return response()->json([
            'code' => 200,
            'message' => 'success',
            'data' => $records
        ]);
    }

    /**
     * 获取植物的照片
     */
    public function photos($id)
    {
        $plant = Plant::find($id);

        if (!$plant) {
            return response()->json([
                'code' => 404,
                'message' => '植物不存在',
                'data' => null
            ], 404);
        }

        $photos = $plant->photos()->orderBy('photo_date', 'desc')->get();

        return response()->json([
            'code' => 200,
            'message' => 'success',
            'data' => $photos
        ]);
    }

    /**
     * 批量添加植物照片
     * body: { urls: string[] }  —— 前端先经 /api/upload 上传拿到 URL，再批量登记
     */
    public function addPhotos(Request $request, $id)
    {
        $plant = Plant::find($id);

        if (!$plant) {
            return response()->json([
                'code' => 404,
                'message' => '植物不存在',
                'data' => null
            ], 404);
        }

        $this->validate($request, [
            'urls' => 'required|array|min:1|max:9',
            'urls.*' => 'required|string|max:500',
        ]);

        $urls = $request->input('urls');
        $photoDate = date('Y-m-d');

        foreach ($urls as $url) {
            \App\Models\PlantPhoto::create([
                'plant_id' => $plant->id,
                'url' => $url,
                'photo_date' => $photoDate,
            ]);
        }

        $photos = $plant->photos()->orderBy('photo_date', 'desc')->get();

        return response()->json([
            'code' => 200,
            'message' => '添加成功',
            'data' => $photos
        ]);
    }
}
