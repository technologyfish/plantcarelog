<?php

namespace App\Http\Controllers;

use App\Models\CareRecord;
use Illuminate\Http\Request;

class CareRecordController extends Controller
{
    /**
     * 获取养护记录列表
     * user_id 参数：缺省=1（小程序兼容）、'all'=全部用户、数字=指定用户
     */
    public function index(Request $request)
    {
        $userId = $request->input('user_id', 1);

        $query = CareRecord::query()->with(['plant', 'user']);

        if ($userId !== 'all') {
            $query->where('user_id', (int)$userId);
        }

        if ($request->has('type') && $request->type !== 'all') {
            $query->where('type', $request->type);
        }

        if ($request->has('plant_id') && $request->plant_id) {
            $query->where('plant_id', $request->plant_id);
        }

        if ($request->has('start_date')) {
            $query->where('care_date', '>=', $request->start_date);
        }

        if ($request->has('end_date')) {
            $query->where('care_date', '<=', $request->end_date);
        }

        $records = $query->orderBy('care_date', 'desc')
            ->orderBy('care_time', 'desc')
            ->get();

        return response()->json([
            'code' => 200,
            'message' => 'success',
            'data' => $records
        ]);
    }

    /**
     * 创建养护记录
     */
    public function store(Request $request)
    {
        $this->validate($request, [
            'plant_id' => 'required|integer|exists:plants,id',
            'type' => 'required|in:water,fertilize,prune,pest,soil,other',
            'care_date' => 'required|date',
            'care_time' => 'nullable',
            'amount' => 'nullable|string',
            'note' => 'nullable|string',
        ]);

        // user_id：缺省取植物所有者（小程序端即用户本人），管理后台可显式指定
        $userId = (int)($request->input('user_id') ?: 0);
        if (!$userId) {
            $plant = \App\Models\Plant::find($request->plant_id);
            $userId = $plant ? $plant->user_id : 1;
        }

        $record = CareRecord::create([
            'user_id' => $userId,
            'plant_id' => $request->plant_id,
            'type' => $request->type,
            'care_date' => $request->care_date,
            'care_time' => $request->care_time,
            'amount' => $request->amount,
            'note' => $request->note,
            'status' => 'done',
        ]);

        return response()->json([
            'code' => 200,
            'message' => '添加成功',
            'data' => $record
        ]);
    }

    /**
     * 更新养护记录
     */
    public function update(Request $request, $id)
    {
        $record = CareRecord::find($id);

        if (!$record) {
            return response()->json([
                'code' => 404,
                'message' => '记录不存在',
                'data' => null
            ], 404);
        }

        $record->update($request->only([
            'type', 'care_date', 'care_time', 'amount', 'note', 'status'
        ]));

        return response()->json([
            'code' => 200,
            'message' => '更新成功',
            'data' => $record
        ]);
    }

    /**
     * 删除养护记录
     */
    public function destroy($id)
    {
        $record = CareRecord::find($id);

        if (!$record) {
            return response()->json([
                'code' => 404,
                'message' => '记录不存在',
                'data' => null
            ], 404);
        }

        $record->delete();

        return response()->json([
            'code' => 200,
            'message' => '删除成功',
            'data' => null
        ]);
    }

    /**
     * 获取日志（按时间线）
     * user_id 参数：缺省=1（小程序兼容）、'all'=全部用户、数字=指定用户
     */
    public function logs(Request $request)
    {
        $userId = $request->input('user_id', 1);

        $query = CareRecord::query()->with('plant');

        if ($userId !== 'all') {
            $query->where('user_id', (int)$userId);
        }

        if ($request->has('type') && $request->type !== 'all') {
            $query->where('type', $request->type);
        }

        if ($request->has('plant_id') && $request->plant_id) {
            $query->where('plant_id', $request->plant_id);
        }

        $records = $query->orderBy('care_date', 'desc')
            ->orderBy('care_time', 'desc')
            ->get()
            ->map(function ($record) {
                return [
                    'id' => $record->id,
                    'plantId' => $record->plant_id,
                    'plantName' => $record->plant_name,
                    'plantImage' => $record->plant_image,
                    'type' => $record->type,
                    'amount' => $record->amount,
                    'date' => $record->care_date->format('Y-m-d'),
                    'time' => $record->care_time,
                    'note' => $record->note,
                    'month' => $record->care_date->format('Y年m月'),
                ];
            });

        return response()->json([
            'code' => 200,
            'message' => 'success',
            'data' => $records
        ]);
    }
}
