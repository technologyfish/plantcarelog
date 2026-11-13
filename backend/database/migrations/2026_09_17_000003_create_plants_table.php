<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreatePlantsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('plants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('category_id')->nullable()->constrained('plant_categories')->onDelete('set null');
            $table->string('name')->comment('植物名称');
            $table->string('scientific_name')->nullable()->comment('学名');
            $table->string('image')->nullable()->comment('植物图片');
            $table->text('description')->nullable()->comment('描述');
            $table->date('plant_date')->nullable()->comment('种植/购买日期');
            $table->integer('care_cycle')->default(7)->comment('养护周期(天)');
            $table->string('difficulty')->nullable()->comment('养护难度');
            $table->string('light')->nullable()->comment('光照需求');
            $table->string('temperature')->nullable()->comment('适宜温度');
            $table->string('humidity')->nullable()->comment('湿度需求');
            $table->json('tags')->nullable()->comment('标签');
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
        Schema::dropIfExists('plants');
    }
}
