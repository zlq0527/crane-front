<template>
  <div @click="handleClick">
    <el-main>
      <div style="margin-top:-20px">
        <p style="font-size:20px;font-weight: bold;">塔吊信息</p>
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
        <el-table-column prop="craneName" label="塔吊名称" width="180"></el-table-column>
        <el-table-column prop="img" label="图片" width="180">
          <template slot-scope="scope">
            <el-image :src="getImageUrl(scope.row.imgUid)" style="width: 100px; height: 100px;"></el-image>
          </template>
        </el-table-column>
        <el-table-column prop="locationName" label="塔吊位置"></el-table-column>
        <el-table-column prop="company" label="承包公司"></el-table-column>
        <el-table-column prop="principalName" label="负责人"></el-table-column>
        <el-table-column prop="principalPhone" label="负责人手机号"></el-table-column>
        <el-table-column prop="deviceName" label="关联设备名称"></el-table-column>
        <el-table-column label="操作" width="200" align="center">
          <template slot-scope="scope">
            <el-button @click="showCraneData(scope.row)">实时数据</el-button>
            <el-button @click="locateOnMap">跳转到地图</el-button>
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
      <el-dialog title="添加塔吊信息" :visible.sync="dialogFormVisible">
        <el-form :model="form" label-width="120px">
          <el-form-item label="塔吊名称">
            <el-input v-model="form.craneName" autocomplete="off"></el-input>
          </el-form-item>
          <el-form-item label="塔吊地址">
            <el-input v-model="form.locationName" autocomplete="off"></el-input>
          </el-form-item>
          <el-form-item label="承包公司">
            <el-input v-model="form.company" autocomplete="off"></el-input>
          </el-form-item>
          <el-form-item label="负责人姓名">
            <el-input v-model="form.principalName" autocomplete="off"></el-input>
          </el-form-item>
          <el-form-item label="负责人手机号">
            <el-input v-model="form.principalPhone" autocomplete="off"></el-input>
          </el-form-item>
          <el-form-item label="关联设备">
            <el-select v-model="form.equipmentId" placeholder="请选择关联设备" clearable @clear="clearEquipment">
              <el-option
                  v-for="item in equipmentList"
                  :key="item.id"
                  :label="item.deviceName"
                  :value="item.id">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="上传图片">
            <el-upload v-model="form.imgUid"
                       action="http://localhost:8081/common/upload"
                       ref="upload"
                       :on-success="handleUploadSuccess"
                       :on-remove="handleUploadRemove"
                       :before-upload="beforeUpload"
                       list-type="picture-card"
                       :show-file-list="false"
                       :default-file-list="defaultFileList">
              <img class="avatar" v-if="uuid!==''" :src="'http://localhost:8081/common/getImg/'+uuid"/>
              <i v-else class="el-icon-plus"></i>
            </el-upload>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="dialogFormVisible = false">取消</el-button>
          <el-button type="primary" @click="saveOrUpdate">确定</el-button>
        </div>
      </el-dialog>
      <el-dialog title="塔吊实时数据" :visible.sync="dialogDataVisible" @close="handleDialogClose">
        <el-table :data="detail" stripe style="width: 100%" :cell-style="cellStyle">
          <!--        <el-table-column prop="id" label="ID" width="180"></el-table-column>-->
          <el-table-column prop="temporary" label="温度/摄氏度°" width="180"></el-table-column>
          <el-table-column prop="weight" label="重量/吨"></el-table-column>
          <el-table-column prop="winSpeed" label="风速KM/H"></el-table-column>
          <el-table-column prop="distance" label="距离/M"></el-table-column>
          <el-table-column prop="angle" label="角度/°"></el-table-column>
<!--          <el-table-column prop="gmtCreate" label="数据上报时间" :formatter="formatDate"></el-table-column>-->
        </el-table>
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
      dialogDataVisible: false,
      mapVisible: false,
      uuid: "",
      defaultFileList: [], // 用于回显图片的数组
      equipmentList: [],
      roleId: "",
      isSidebarOpen: false,
      detail:[]
    }
  },
  created() {
    this.load()
    this.fetchEquipmentList()
    this.roleId = localStorage.getItem("roleId");
    console.log(this.roleId)
  },
  methods: {
    fetchEquipmentList() {
      request.get("/crane/equipment/listAllEquipment")
          .then(response => {
            this.equipmentList = response.data
          })
    },
    cellStyle({row, column, rowIndex, columnIndex}) {
      if (rowIndex === 0 && columnIndex === 0 && row.temporary > 40) {
        return 'color:red;';
      } else if (rowIndex === 0 && columnIndex === 1 && row.weight > 2500) {
        return 'color:red;';
      } else if (rowIndex === 0 && columnIndex === 2 && row.winSpeed > 12) {
        return 'color:red;';
      }
      // else if (rowIndex === 0 && columnIndex === 3 && row.distance > 200) {
      //   return 'color:red;';
      // } else if (rowIndex === 0 && columnIndex === 4 && row.angle > 0) {
      //   return 'color:red;';
      // }
    },
    showCraneData(row) {
      this.dialogDataVisible = true; // 显示对话框
      const fetchData = () => {
        request.get("/crane/data/getById?id=" + row.id).then(response => {
          this.detail = response.data;
        });
      };
      fetchData();
      this.refreshInterval = setInterval(fetchData, 1000);
    },
    handleDialogClose() {
      clearInterval(this.refreshInterval);
    },
    // 新增或编辑按钮点击事件
    addOrUpdate() {
      this.editMode = false; // 切换到新增模式
      this.form = {}; // 清空表单数据
      this.dialogFormVisible = true; // 显示对话框
    },
    clearEquipment() {
      this.form.equipmentId = ''; // 清空设备ID
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
    handleUploadRemove(file, fileList) {
      // 用户移除上传的图片时，清空表单中的图片地址
      this.form.imageUrl = '';
    },
    beforeUpload(file) {
      const isJPG = (file.type === 'image/jpeg' || file.type === 'image/png');
      const isLt2M = file.size / 1024 / 1024 < 5;
      if (!isJPG) {
        this.$message.error('上传头像图片只能是 JPG 格式!');
        this.imageUrl = ''
      }
      if (!isLt2M) {
        this.$message.error('上传头像图片大小不能超过 5MB!');
        this.imageUrl = ''
      }
      return isJPG && isLt2M;
    },
    handleUploadSuccess(res) {
      this.uuid = res.data
      this.form.imgUid = this.uuid
    },
    getImageUrl(uid) {
      return `http://localhost:8081/common/getImg/${uid}`
    },
    del(id) {
      request.get("/crane/info/deleteById?id=" + id).then(res => {
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
      if (row.imgUid) {
        this.defaultFileList = [{name: 'image', url: 'http://localhost:8081/common/getImg/' + row.imgUid}];
      } else {
        this.defaultFileList = [{}]
      }
      this.form = row;
      // 将设备ID改为设备名称
      // this.form.equipmentId = row.deviceName;
      const deviceName = row.deviceName;
      // 根据设备名称找到对应的设备ID
      const equipment = this.equipmentList.find(item => item.deviceName === deviceName);
      if (equipment) {
        // 如果找到了对应的设备ID，则将其赋值给表单的equipmentId字段
        this.form.equipmentId = equipment.id;
      }
      this.editMode = true
      this.dialogFormVisible = true
    },
    add() {
      this.form = {}
      this.dialogFormVisible = true
    },
    save() {
      request.post("/crane/info/insert", this.form).then(res => {
        if (res.code === 200) {
          this.$message.success("保存成功");
          this.dialogFormVisible = false;
          this.load();
        } else {
          this.$message.error(res.msg);
          this.load();
        }
      })
    },
    // 保存编辑
    update() {
      request.post("/crane/info/update", this.form).then(res => {
        if (res.code === 200) {
          this.$message.success("更新成功");
          this.dialogFormVisible = false;
          this.load();
        } else {
          this.$message.error(res.msg);
        }
      });
    },
    reset() {
      this.craneName = ""
      this.load()
    },
    load() {
      request.post("/crane/info/listPage", {
        pageNum: this.pageNum,
        pageSize: this.pageSize,
        craneName: this.craneName
      }).then(res => {
            if (res.data == null) {
              this.$message.success("未查到数据");
              this.tableData = null;
            } else {
              this.tableData = res.data.list;
              this.total = res.data.total
            }
          }
      )
    },
    handleSizeChange(pageSize) {
      console.log(pageSize)
      this.pageSize = pageSize
      this.load()
    },
    handleCurrentChange(pageNum) {
      console.log(pageNum)
      this.pageNum = pageNum
      this.load()
    },
    handleClick(event) {
      if (!this.$el.contains(event.target)) {
        // 如果点击事件不在当前组件内部，则关闭侧边栏
        this.closeSidebar();
      }
    }
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
