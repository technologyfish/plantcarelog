<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateCareRecordsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('care_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('plant_id')->constrained()->onDelete('cascade');
            $table->enum('type', ['water', 'fertilize', 'prune', 'pest', 'soil', 'other'])->comment('养护类型');
            $table->string('amount')->nullable()->comment('用量');
            $table->date('care_date')->comment('养护日期');
            $table->time('care_time')->nullable()->comment('养护时间');
            $table->text('note')->nullable()->comment('备注');
            $table->enum('status', ['done', 'pending'])->default('done')->comment('状态');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('care_records');
    }
}
