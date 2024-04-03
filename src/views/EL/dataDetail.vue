<template>
  <div>
    <el-main>
      <div style="margin-top:-20px">
        <p style="font-size:20px;font-weight: bold;">设备上报数据信息</p>
      </div>

      <el-table :data="tableData" stripe style="width: 100%">
<!--        <el-table-column prop="id" label="ID" width="180"></el-table-column>-->
        <el-table-column prop="temporary" label="温度/摄氏度°" width="180"></el-table-column>
        <el-table-column prop="weight" label="重量/吨"></el-table-column>
        <el-table-column prop="winSpeed" label="风速KM/H"></el-table-column>
        <el-table-column prop="distance" label="距离/M"></el-table-column>
        <el-table-column prop="angle" label="角度/°"></el-table-column>
        <el-table-column prop="gmtCreate" label="数据上报时间" :formatter="formatDate"></el-table-column>
      </el-table>
      <div style="padding: 10px 0">
        <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="pageNum"
            :page-sizes="[20,50,100,]"
            :page-size="pageSize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total">
        </el-pagination>
      </div>
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
      pageSize: 20,
      msg: "",
      collapseBtnClass: 'el-icon-s-fold',
      isCollapse: false,
      sideWidth: 200,
      logoTextShow: true,
      headerBg: 'headerBg',
      dialogFormVisible: false,
      deviceId:""
    }
  },
  created() {
    this.deviceId = this.$route.params.id;
    this.load()
    this.timer = setInterval(this.load, 2000);
  },
  beforeDestroy() {
    clearInterval(this.timer); // 清除定时器
  },
  methods: {
    load() {
      request.post("/crane/data/listPage", {
        pageNum: this.pageNum,
        pageSize: this.pageSize,
        deviceId: this.deviceId
      }).then(res => {
            if (res.data == null) {
              // this.$message.error("未查到数据");
              this.tableData = null;
            } else {
              this.tableData = res.data.list;
              this.total = res.data.total
            }
          }
      )
    },
    formatDate(row,column) {
      const date = new Date(row[column.property]); // 获取原始时间数据
      return date.toLocaleString();
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
