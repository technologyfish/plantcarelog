<?php

namespace App\Http\Controllers;

use App\Models\PlantCategory;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    /**
     * 获取分类列表
     * user_id 参数：缺省=1（小程序兼容）、'all'=全部用户、数字=指定用户
     */
    public function index(Request $request)
    {
        try {
            $userId = $request->input('user_id', 1);

            $query = PlantCategory::query()->with('user');

            if ($userId !== 'all') {
                $query->where('user_id', (int)$userId);
            }

            $categories = $query->orderBy('sort_order')->get();

            return response()->json([
                'code' => 200,
                'message' => 'success',
                'data' => $categories
            ]);
        } catch (\Exception $e) {
            // 数据库不可用时返回模拟数据
            return response()->json([
                'code' => 200,
                'message' => 'success (mock data)',
                'data' => [
                    ['id' => 1, 'name' => '室内植物', 'icon' => '', 'plant_count' => 5],
                    ['id' => 2, 'name' => '观叶植物', 'icon' => '', 'plant_count' => 2],
                    ['id' => 3, 'name' => '多肉植物', 'icon' => '', 'plant_count' => 3],
                    ['id' => 4, 'name' => '草本花卉', 'icon' => '', 'plant_count' => 2],
                    ['id' => 5, 'name' => '香草植物', 'icon' => '', 'plant_count' => 2],
                    ['id' => 6, 'name' => '仙人掌类', 'icon' => '', 'plant_count' => 3],
                ]
            ]);
        }
    }

    /**
     * 创建分类
     */
    public function store(Request $request)
    {
        $this->validate($request, [
            'name' => 'required|string|max:50',
            'icon' => 'nullable|string',
        ]);

        // user_id：缺省=1（小程序兼容），管理后台可指定归属用户
        $userId = (int)($request->input('user_id') ?: 1);

        // 获取该用户最大排序值
        $maxSort = PlantCategory::where('user_id', $userId)->max('sort_order') ?? 0;

        $category = PlantCategory::create([
            'user_id' => $userId,
            'name' => $request->name,
            'icon' => $request->icon,
            'sort_order' => $maxSort + 1,
        ]);

        return response()->json([
            'code' => 200,
            'message' => '添加成功',
            'data' => $category
        ]);
    }

    /**
     * 更新分类
     */
    public function update(Request $request, $id)
    {
        $category = PlantCategory::find($id);

        if (!$category) {
            return response()->json([
                'code' => 404,
                'message' => '分类不存在',
                'data' => null
            ], 404);
        }

        $category->update($request->only(['name', 'icon', 'sort_order']));

        return response()->json([
            'code' => 200,
            'message' => '更新成功',
            'data' => $category
        ]);
    }

    /**
     * 删除分类
     */
    public function destroy($id)
    {
        $category = PlantCategory::find($id);

        if (!$category) {
            return response()->json([
                'code' => 404,
                'message' => '分类不存在',
                'data' => null
            ], 404);
        }

        // 将该分类下的植物设为未分类
        $category->plants()->update(['category_id' => null]);
        $category->delete();

        return response()->json([
            'code' => 200,
            'message' => '删除成功',
            'data' => null
        ]);
    }
}
