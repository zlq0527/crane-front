<template>
  <div>
    <el-main>
      <div style="margin-top:-20px">
        <p style="font-size:20px;font-weight: bold;">设备信息</p>
      </div>
      <div class="function" style="margin-bottom: 30px;">
        <el-button type="primary" @click="addOrUpdate">增加<i class="el-icon-circle-plus-outline"></i></el-button>
        <el-input
            style="margin-left:15px"
            class="Search"
            size="medium"
            placeholder="请输入名称"
            v-model="craneName">
        </el-input>
        <el-button style="margin-left:10px" @click="reset">重置</el-button>
        <el-button type="primary" @click="load">搜索</el-button>
      </div>

      <el-table :data="tableData" stripe style="width: 100%">
<!--        <el-table-column prop="id" label="ID" width="180"></el-table-column>-->
        <el-table-column prop="craneDataId" label="关联数据id" width="180"></el-table-column>
        <el-table-column prop="deviceName" label="设备名称"></el-table-column>
        <el-table-column prop="deviceType" label="设备类型"></el-table-column>
        <el-table-column prop="sensor" label="传感器"></el-table-column>
        <el-table-column label="操作" width="400" align="center">
          <template slot-scope="scope">
            <el-button size="small" type="primary" @click="detail(scope.row.craneDataId)">查看设备上报数据<i class="el-icon-edit"></i></el-button>
            <el-button v-show="roleId==='1'" size="small" type="primary" @click="edit(scope.row)">编辑<i class="el-icon-edit"></i></el-button>
            <el-button v-show="roleId==='1'" size="small" type="danger" @click="del(scope.row.id)">删除<i class="el-icon-remove-outline"></i>
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <div style="padding: 10px 0">
        <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="pageNum"
            :page-sizes="[10, 20, 50]"
            :page-size="pageSize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total">
        </el-pagination>
      </div>
      <el-dialog title="添加设备" :visible.sync="dialogFormVisible">
        <el-form :model="form" label-width="120px">
          <el-form-item label="设备名称">
            <el-input v-model="form.deviceName" autocomplete="off"></el-input>
          </el-form-item>
          <el-form-item label="关联数据Id">
            <el-input v-model="form.craneDataId" autocomplete="off"></el-input>
          </el-form-item>
          <el-form-item label="设备类型">
            <el-input v-model="form.deviceType" autocomplete="off"></el-input>
          </el-form-item>
          <el-form-item label="传感器">
            <el-input v-model="form.sensor" autocomplete="off"></el-input>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="dialogFormVisible = false">取消</el-button>
          <el-button type="primary" @click="saveOrUpdate">确定</el-button>
        </div>
      </el-dialog>
    </el-main>
  </div>
</template>
<style>
.demo-table-expand {
  font-size: 0;
}

.demo-table-expand label {
  width: 90px;
  color: #99a9bf;
}

.demo-table-expand .el-form-item {
  margin-left: 50px;
  margin-bottom: 0;
  width: 50%;
}
</style>
<script>
import request from "@/utils/request";

export default {
  name: "Elderly",
  data() {
    return {
      select: '',
      craneName: '',
      form: {},
      tableData: [],
      total: 0,
      pageNum: 1,
      pageSize: 10,
      msg: "",
      collapseBtnClass: 'el-icon-s-fold',
      isCollapse: false,
      sideWidth: 200,
      logoTextShow: true,
      headerBg: 'headerBg',
      dialogFormVisible: false,
      roleId:""
    }
  },
  created() {
    this.load()
    this.roleId = localStorage.getItem("roleId");
  },
  methods: {
    // 新增或编辑按钮点击事件
    addOrUpdate() {
      this.editMode = false; // 切换到新增模式
      this.form = {}; // 清空表单数据
      this.dialogFormVisible = true; // 显示对话框
    },

    detail(id) {
      this.$router.push({ name: 'dataDetail', params: { id: id }});
    },

    // 保存或编辑按钮点击事件
    saveOrUpdate() {
      if (this.editMode) {
        // 编辑模式
        this.update();
      } else {
        // 新增模式
        this.save();
      }
    },
    del(id) {
      request.get("/crane/equipment/deleteById?id=" + id).then(res => {
        if (res) {
          this.$message.success("删除成功")
          this.dialogFormVisible = false
          this.load()
        } else {
          this.$message.error("删除失败")
        }
      })
    },
    edit(row) {
      this.form = row;
      this.editMode = true
      this.dialogFormVisible = true
    },
    add() {
      this.form = {}
      this.dialogFormVisible = true
    },
    save() {
      request.post("/crane/equipment/insert", this.form).then(res => {
        if (res) {
          this.$message.success("保存成功")
          this.dialogFormVisible = false
          this.load()
        } else {
          this.$message.error("保存失败")
        }
      })
    },
    // 保存编辑
    update() {
      request.post("/crane/equipment/update", this.form).then(res => {
        console.log(res)
        if (res.code === 200) {
          this.$message.success("更新成功");
          this.dialogFormVisible = false;
          this.load();
        } else {
          this.dialogFormVisible = false;
          this.$message.error(res.msg);
        }
      });
    },
    reset() {
      this.craneName = ""
      this.load()
    },
    load() {
      request.get(`/crane/equipment/listPage?pageNum=${this.pageNum}&pageSize=${this.pageSize}`).then(res => {
            if (res.data == null) {
              this.tableData = null;
            } else {
              this.tableData = res.data.records;
              this.total = res.data.total
            }
          }
      )
    },
    handleSizeChange(pageSize) {
      this.pageSize = pageSize
      this.load()
    },
    handleCurrentChange(pageNum) {
      this.pageNum = pageNum
      this.load()
    },
  }

}
</script>
<style>
.function {
  margin-top: 20px;
  padding: 20px;
  background-color: white;
  border-radius: 7px;
}

.Search {
  width: 200px;
}

.headerBg {
  background: #eee !important;
}

.avatar{
  width: 148px;
  height: 148px;
  display: block;
}
</style>
