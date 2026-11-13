<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Plant;
use App\Models\CareRecord;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Carbon\Carbon;

class UserController extends Controller
{
    /**
     * 获取用户信息
     */
    public function profile(Request $request)
    {
        try {
            // TODO: 从认证中获取用户ID
            $userId = 1;

            $user = User::find($userId);

            if (!$user) {
                // 创建默认用户
                $user = User::create([
                    'openid' => 'test_openid',
                    'nickname' => '小绿同学',
                    'signature' => '和植物一起，记录生活',
                ]);
            }

            // 统计数据
            $plantCount = Plant::where('user_id', $userId)->count();
            $todayCare = CareRecord::where('user_id', $userId)
                ->whereDate('care_date', Carbon::today())
                ->count();
            $totalCare = CareRecord::where('user_id', $userId)->count();
            
            // 记录天数（有记录的不同天数）
            $recordDays = CareRecord::where('user_id', $userId)
                ->distinct('care_date')
                ->count('care_date');

            return response()->json([
                'code' => 200,
                'message' => 'success',
                'data' => [
                    'id' => $user->id,
                    'nickname' => $user->nickname,
                    'avatar' => $user->avatar,
                    'signature' => $user->signature,
                    'plantCount' => $plantCount,
                    'todayCare' => $todayCare,
                    'totalCare' => $totalCare,
                    'recordDays' => $recordDays,
                ]
            ]);
        } catch (\Exception $e) {
            // 数据库不可用时返回模拟数据
            return response()->json([
                'code' => 200,
                'message' => 'success (mock data)',
                'data' => [
                    'id' => 1,
                    'nickname' => '小绿同学',
                    'avatar' => '',
                    'signature' => '和植物一起，记录生活',
                    'plantCount' => 8,
                    'todayCare' => 12,
                    'totalCare' => 5,
                    'recordDays' => 3,
                ]
            ]);
        }
    }

    /**
     * 更新用户信息
     */
    public function updateProfile(Request $request)
    {
        // TODO: 从认证中获取用户ID
        $userId = 1;

        $user = User::find($userId);

        if (!$user) {
            return response()->json([
                'code' => 404,
                'message' => '用户不存在',
                'data' => null
            ], 404);
        }

        $user->update($request->only(['nickname', 'avatar', 'signature']));

        return response()->json([
            'code' => 200,
            'message' => '更新成功',
            'data' => $user
        ]);
    }

    // ==================== 管理后台：用户管理 ====================

    /**
     * 用户列表（管理后台）
     * 支持参数：search（昵称搜索）
     */
    public function index(Request $request)
    {
        $query = User::query()->withCount('plants');

        if ($request->has('search') && $request->search !== '') {
            $query->where('nickname', 'like', '%' . $request->search . '%');
        }

        $users = $query->orderBy('created_at', 'desc')->get();

        return response()->json([
            'code' => 200,
            'message' => 'success',
            'data' => $users
        ]);
    }

    /**
     * 创建用户（管理后台）
     */
    public function store(Request $request)
    {
        $this->validate($request, [
            'nickname' => 'required|string|max:50',
            'avatar' => 'nullable|string',
            'signature' => 'nullable|string|max:100',
        ]);

        $user = User::create([
            'openid' => 'admin_' . Str::uuid(),
            'nickname' => $request->nickname,
            'avatar' => $request->avatar,
            'signature' => $request->signature,
        ]);

        return response()->json([
            'code' => 200,
            'message' => '添加成功',
            'data' => $user
        ]);
    }

    /**
     * 更新用户（管理后台）
     */
    public function update(Request $request, $id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json([
                'code' => 404,
                'message' => '用户不存在',
                'data' => null
            ], 404);
        }

        $user->update($request->only(['nickname', 'avatar', 'signature']));

        return response()->json([
            'code' => 200,
            'message' => '更新成功',
            'data' => $user
        ]);
    }

    /**
     * 删除用户（管理后台）
     * 级联删除该用户的植物、分类、养护记录（数据库外键级联）
     */
    public function destroy($id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json([
                'code' => 404,
                'message' => '用户不存在',
                'data' => null
            ], 404);
        }

        if ((int)$id === 1) {
            return response()->json([
                'code' => 400,
                'message' => '默认用户不可删除（小程序端依赖）',
                'data' => null
            ], 400);
        }

        $user->delete();

        return response()->json([
            'code' => 200,
            'message' => '删除成功',
            'data' => null
        ]);
    }
}
