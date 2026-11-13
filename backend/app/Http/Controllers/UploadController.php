<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Str;

class UploadController extends Controller
{
    /**
     * 上传文件
     * 注意：微信端 uploadFile 上传的临时文件经常没有扩展名，
     * 不能依赖 mimes 扩展名校验 —— 改为按文件内容(finfo)判断图片类型。
     */
    public function upload(Request $request)
    {
        $this->validate($request, [
            'file' => 'required|file|max:5120',
        ]);

        $file = $request->file('file');

        // 按实际内容判断 MIME，仅接受图片
        $mime = $file->getMimeType();
        if (!str_starts_with($mime, 'image/')) {
            return response()->json([
                'code' => 422,
                'message' => '仅支持上传图片文件',
                'data' => null,
            ], 422);
        }

        // 按内容类型推断扩展名（兜底 jpg）
        $extMap = [
            'image/jpeg' => 'jpg',
            'image/png' => 'png',
            'image/gif' => 'gif',
            'image/webp' => 'webp',
            'image/bmp' => 'bmp',
        ];
        $ext = $extMap[$mime] ?? 'jpg';

        // 生成文件名
        $filename = Str::uuid() . '.' . $ext;
        
        // 按日期分目录存储
        $directory = 'uploads/' . date('Y/m/d');
        
        // 移动文件
        $file->move(storage_path('app/public/' . $directory), $filename);
        
        // 返回访问URL
        $url = url('storage/' . $directory . '/' . $filename);

        return response()->json([
            'code' => 200,
            'message' => '上传成功',
            'data' => [
                'url' => $url,
                'filename' => $filename,
            ]
        ]);
    }
}
