<template>
  <div class="data-center-container">
    <div class="header">
      <div class="title">塔吊监控数据中心</div>
      <!-- <div class="login-btn">
        <el-button type="primary" size="small" @click="loginSystem">进入系统 <i class="el-icon-arrow-right"></i></el-button>
      </div> -->
    </div>
    
    <div class="content">
      <!-- 塔吊选择区域 -->
      <div class="section">
        <div class="section-title">
          <i class="el-icon-s-operation"></i> 塔吊选择
        </div>
        <div class="select-box">
          <el-select v-model="selectedCraneId" placeholder="请选择塔吊" size="small" @change="handleCraneChange" style="width: 220px;">
            <el-option 
              v-for="item in craneList" 
              :key="item.id" 
              :label="item.craneName" 
              :value="item.id">
            </el-option>
          </el-select>
        </div>
      </div>
      
      <!-- 塔吊实时数据 -->
      <div class="section" v-if="selectedCraneId">
        <div class="section-title">
          <i class="el-icon-data-line"></i> 塔吊实时数据
          <span class="refresh-status">{{ autoRefresh ? '自动刷新中' : '刷新已暂停' }}</span>
          <div class="refresh-control">
            <el-button size="mini" type="text" @click="toggleRefresh">
              {{ autoRefresh ? '暂停刷新' : '开始刷新' }}
            </el-button>
            <el-button size="mini" type="text" @click="fetchCraneData" :loading="loading">
              <i class="el-icon-refresh"></i> 立即刷新
            </el-button>
          </div>
        </div>
        
        <div v-if="loading && !craneData.id" class="loading-container">
          <i class="el-icon-loading"></i>
          <div>加载数据中...</div>
        </div>
        
        <div v-else>
          <div class="stats-cards">
            <div class="stat-card">
              <div class="icon-box blue-bg">
                <i class="el-icon-reading"></i>
              </div>
              <div class="stat-info">
                <div class="label">温度 (°C)</div>
                <div class="value">{{craneData.temporary || '--'}}</div>
              </div>
            </div>
            <div class="stat-card">
              <div class="icon-box green-bg">
                <i class="el-icon-heavy-rain"></i>
              </div>
              <div class="stat-info">
                <div class="label">风速 (m/s)</div>
                <div class="value">{{craneData.winSpeed || '--'}}</div>
              </div>
            </div>
            <div class="stat-card">
              <div class="icon-box purple-bg">
                <i class="el-icon-odometer"></i>
              </div>
              <div class="stat-info">
                <div class="label">角度 (°)</div>
                <div class="value">{{craneData.angle || '--'}}</div>
              </div>
            </div>
            <div class="stat-card">
              <div class="icon-box orange-bg">
                <i class="el-icon-s-grid"></i>
              </div>
              <div class="stat-info">
                <div class="label">距离 (m)</div>
                <div class="value">{{craneData.distance || '--'}}</div>
              </div>
            </div>
          </div>
          <!-- 重量显示区域 - 更大更明显 -->
          <div class="weight-display">
            <div class="weight-title">当前重量</div>
            <div class="weight-value">{{craneData.weight || '--'}} <span class="weight-unit">kg</span></div>
          </div>
          
          <!-- 仪表盘展示区域 -->
          <div class="gauge-area">
            <div class="gauge-wrapper">
              <div class="gauge-title">温度</div>
              <div class="gauge">
                <div class="gauge-center" :style="getTemperatureStyle()">
                  <span>{{craneData.temporary || '--'}}°C</span>
                </div>
              </div>
            </div>
            
            <div class="gauge-wrapper">
              <div class="gauge-title">风速</div>
              <div class="gauge">
                <div class="gauge-center" :style="getWindSpeedStyle()">
                  <span>{{craneData.winSpeed || '--'}} m/s</span>
                </div>
              </div>
            </div>
            
            <div class="gauge-wrapper">
              <div class="gauge-title">载重</div>
              <div class="gauge">
                <div class="gauge-center" :style="getWeightStyle()">
                  <span>{{craneData.weight || '--'}} kg</span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 塔吊状态指示 -->
          <div class="crane-status">
            <div class="status-title">塔吊工作状态</div>
            <div class="status-indicators">
              <div class="status-item" :class="{'status-normal': isWeightNormal(), 'status-warning': !isWeightNormal()}">
                <i :class="isWeightNormal() ? 'el-icon-success' : 'el-icon-warning'"></i>
                <span>载重状态: {{isWeightNormal() ? '正常' : '超重警告!'}}</span>
              </div>
              <div class="status-item" :class="{'status-normal': isWindSpeedNormal(), 'status-warning': !isWindSpeedNormal()}">
                <i :class="isWindSpeedNormal() ? 'el-icon-success' : 'el-icon-warning'"></i>
                <span>风速状态: {{isWindSpeedNormal() ? '正常' : '强风警告!'}}</span>
              </div>
              <div class="status-item" :class="{'status-normal': isTemperatureNormal(), 'status-warning': !isTemperatureNormal()}">
                <i :class="isTemperatureNormal() ? 'el-icon-success' : 'el-icon-warning'"></i>
                <span>温度状态: {{isTemperatureNormal() ? '正常' : '温度异常!'}}</span>
              </div>
            </div>
          </div>

          <!-- 塔吊位置信息 -->
          <div class="crane-location">
            <div class="section-title">
              <i class="el-icon-location"></i> 塔吊位置
            </div>
            <div class="location-info">
              <div class="location-item">
                <span class="location-label">当前位置:</span>
                <span class="location-value">{{selectedCrane ? selectedCrane.locationName || '未设置' : '未知'}}</span>
              </div>
            </div>
            <!-- 直接在页面上显示地图 -->
            <div v-if="selectedCrane && selectedCrane.locationName" class="map-container">
              <div id="mapContainer" style="width: 100%; height: 100%;"></div>
            </div>
          </div>
          
          <!-- 最近数据记录 -->
          <div class="section history-section">
            <div class="section-title">
              <i class="el-icon-time"></i> 最近数据记录
            </div>
            <el-table :data="historyData" size="small" stripe border style="width: 100%">
              <el-table-column prop="time" label="时间" width="180"></el-table-column>
              <el-table-column prop="temporary" label="温度(°C)" width="100"></el-table-column>
              <el-table-column prop="weight" label="重量(kg)" width="100"></el-table-column>
              <el-table-column prop="winSpeed" label="风速(m/s)" width="100"></el-table-column>
              <el-table-column prop="distance" label="距离(m)" width="100"></el-table-column>
              <el-table-column prop="angle" label="角度(°)" width="100"></el-table-column>
            </el-table>
          </div>
        </div>
      </div>
      
      <!-- 未选择塔吊时的提示 -->
      <div class="no-selection" v-if="!selectedCraneId">
        <i class="el-icon-warning-outline"></i>
        <div>请选择塔吊以查看实时数据</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DataCenter',
  data() {
    return {
      selectedCraneId: null,
      craneList: [],
      loading: false,
      craneData: {
        id: null,
        temporary: '',
        weight: null,
        winSpeed: null,
        distance: null,
        angle: null
      },
      timer: null,
      autoRefresh: true,
      refreshInterval: 5000, // 5秒刷新一次
      historyData: [],
      craneListQuery: {
        current: 1,
        size: 50  // 增大页面大小，避免分页
      },
      craneListTotal: 0,
      debug: false, // 关闭调试模式
    }
  },
  created() {
    // 初始化时获取塔吊列表
    this.fetchCraneList();
  },
  mounted() {
    // 页面挂载后，选择默认塔吊
    setTimeout(() => {
      if (this.craneList.length > 0 && !this.selectedCraneId) {
        this.selectedCraneId = this.craneList[0].id;
        this.handleCraneChange(this.selectedCraneId);
      }
    }, 500); // 延迟半秒，确保列表已加载
  },
  beforeDestroy() {
    // 组件销毁前清除定时器
    this.clearRefreshTimer();
  },
  methods: {
    // 获取塔吊列表
    fetchCraneList() {
      this.request.post('/crane/info/listPage', this.craneListQuery).then(res => {
        if (res.code === 200 && res.data) {
          this.craneList = res.data.list || [];
          this.craneListTotal = res.data.total || 0;
        } else {
          this.$message.error(res.msg || '获取塔吊列表失败');
        }
      }).catch(err => {
        console.error('获取塔吊列表失败', err);
      });
    },
    
    // 选择塔吊时的处理
    handleCraneChange(craneId) {
      this.clearRefreshTimer();
      this.craneData = {
        id: null,
        temporary: '',
        weight: null,
        winSpeed: null,
        distance: null,
        angle: null
      };
      this.historyData = [];
      
      if (craneId) {
        this.fetchCraneData();
        if (this.autoRefresh) {
          this.startRefreshTimer();
        }
        // 塔吊选择后初始化地图
        setTimeout(() => this.initMap(), 600);
      }
    },
    
    // 获取塔吊数据
    fetchCraneData() {
      if (!this.selectedCraneId) return;
      
      this.loading = true;
      this.request.get(`/crane/data/getById?id=${this.selectedCraneId}`).then(res => {
        this.loading = false;
        
        if (res.code === 200 && res.data) {
          // 保存当前数据到历史记录
          const now = new Date();
          const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
          
          // 只保留最近10条记录
          if (this.historyData.length >= 10) {
            this.historyData.pop();
          }
          
          let data = res.data[0];
          
          // 确保所有字段都存在
          if (typeof data === 'object') {
            data = {
              id: data.id || this.selectedCraneId,
              temporary: data.temporary || '',
              weight: data.weight || 0,
              winSpeed: data.winSpeed || 0,
              distance: data.distance || 0,
              angle: data.angle || 0
            };
          } else {
            // 如果返回的不是对象，创建一个空对象
            data = {
              id: this.selectedCraneId,
              temporary: '',
              weight: 0,
              winSpeed: 0,
              distance: 0,
              angle: 0
            };
            this.$message.warning('数据格式不正确，显示默认值');
          }
          
          // 添加新记录到开头
          this.historyData.unshift({
            time: timeStr,
            ...data
          });
          
          // 更新当前数据
          this.craneData = data;
        } else {
          this.$message.error(res.msg || '获取塔吊数据失败');
        }
      }).catch(err => {
        this.loading = false;
        console.error('数据获取失败', err);
      });
    },
    
    // 开始定时刷新
    startRefreshTimer() {
      this.timer = setInterval(() => {
        this.fetchCraneData();
      }, this.refreshInterval);
    },
    
    // 清除定时器
    clearRefreshTimer() {
      if (this.timer) {
        clearInterval(this.timer);
        this.timer = null;
      }
    },
    
    // 切换自动刷新
    toggleRefresh() {
      this.autoRefresh = !this.autoRefresh;
      if (this.autoRefresh) {
        this.startRefreshTimer();
      } else {
        this.clearRefreshTimer();
      }
    },
    
    // 获取温度仪表盘样式
    getTemperatureStyle() {
      const temp = parseFloat(this.craneData.temporary) || 0;
      let color = '#67C23A'; // 正常温度绿色
      
      if (temp > 50) {
        color = '#F56C6C'; // 高温红色
      } else if (temp > 35) {
        color = '#E6A23C'; // 偏高温度黄色
      } else if (temp < 0) {
        color = '#409EFF'; // 低温蓝色
      }
      
      return {
        backgroundColor: color,
        boxShadow: `0 0 15px ${color}`
      };
    },
    
    // 获取风速仪表盘样式
    getWindSpeedStyle() {
      const windSpeed = this.craneData.winSpeed || 0;
      let color = '#67C23A'; // 正常风速绿色
      
      if (windSpeed > 20) {
        color = '#F56C6C'; // 强风红色
      } else if (windSpeed > 10) {
        color = '#E6A23C'; // 中风黄色
      }
      
      return {
        backgroundColor: color,
        boxShadow: `0 0 15px ${color}`
      };
    },
    
    // 获取载重仪表盘样式
    getWeightStyle() {
      const weight = this.craneData.weight || 0;
      let color = '#67C23A'; // 正常载重绿色
      
      if (weight > 10000) {
        color = '#F56C6C'; // 超重红色
      } else if (weight > 8000) {
        color = '#E6A23C'; // 接近最大载重黄色
      }
      
      return {
        backgroundColor: color,
        boxShadow: `0 0 15px ${color}`
      };
    },
    
    // 判断载重是否正常
    isWeightNormal() {
      const weight = this.craneData.weight || 0;
      return weight <= 2500;
    },
    
    // 判断风速是否正常
    isWindSpeedNormal() {
      const windSpeed = this.craneData.winSpeed || 0;
      return windSpeed <= 12;
    },
    
    // 判断温度是否正常
    isTemperatureNormal() {
      const temp = parseFloat(this.craneData.temporary) || 0;
      return temp <= 40 && temp >= 0;
    },
    
    // 跳转到系统
    // loginSystem() {
    //   this.$router.push('/login');
    // },

    // 初始化地图
    initMap() {
      if (!this.selectedCrane || !this.selectedCrane.locationName) {
        return;
      }
      
      // 使用nextTick确保DOM已经更新
      this.$nextTick(() => {
        // 创建地图对象
        const map = new BMap.Map("mapContainer");
        // 创建地址解析器实例
        const geoc = new BMap.Geocoder();
        // 将地址解析结果显示在地图上，并调整地图视野
        geoc.getPoint(this.selectedCrane.locationName, function(point) {
          if (point) {
            map.centerAndZoom(point, 16);
            map.addControl(new BMap.NavigationControl());
            map.addOverlay(new BMap.Marker(point));
          } else {
            console.warn("地址解析失败");
          }
        }, this.selectedCrane.locationName);
      });
    },
  },
  computed: {
    selectedCrane() {
      if (!this.selectedCraneId) return null;
      return this.craneList.find(crane => crane.id === this.selectedCraneId) || null;
    }
  },
  watch: {
    'selectedCrane.locationName': function(newVal) {
      if (newVal) {
        setTimeout(() => this.initMap(), 300);
      }
    }
  }
}
</script>

<style scoped>
.data-center-container {
  width: 100%;
  min-height: 100vh;
  background-color: #192c43;
  color: #fff;
  padding: 20px;
  box-sizing: border-box;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 20px;
}

.title {
  font-size: 22px;
  font-weight: bold;
}

.section {
  margin-bottom: 30px;
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 15px;
}

.section-title {
  font-size: 16px;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  position: relative;
}

.section-title i {
  margin-right: 5px;
  color: #409EFF;
}

.refresh-status {
  font-size: 12px;
  color: #67C23A;
  margin-left: 10px;
}

.refresh-control {
  position: absolute;
  right: 0;
  top: 0;
}

.stats-cards {
  display: flex;
  justify-content: space-between;
  margin-top: 15px;
  flex-wrap: wrap;
}

.stat-card {
  background-color: rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  padding: 15px;
  width: 23%;
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.icon-box {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
}

.blue-bg {
  background-color: #409EFF;
}

.green-bg {
  background-color: #67C23A;
}

.purple-bg {
  background-color: #8863F7;
}

.orange-bg {
  background-color: #E6A23C;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 5px;
}

.value {
  font-size: 22px;
  font-weight: bold;
}

.select-box {
  margin-top: 10px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.crane-pagination {
  margin-left: 15px;
}

.no-selection {
  text-align: center;
  margin-top: 50px;
  color: rgba(255, 255, 255, 0.5);
}

.no-selection i {
  font-size: 50px;
  margin-bottom: 20px;
}

.weight-display {
  background-color: rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  margin: 30px 0;
  border: 2px solid #E6A23C;
}

.weight-title {
  font-size: 18px;
  margin-bottom: 10px;
  color: #E6A23C;
}

.weight-value {
  font-size: 36px;
  font-weight: bold;
}

.weight-unit {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.7);
}

.gauge-area {
  display: flex;
  justify-content: space-between;
  margin: 30px 0;
}

.gauge-wrapper {
  text-align: center;
  width: 30%;
}

.gauge-title {
  margin-bottom: 15px;
  font-size: 16px;
}

.gauge {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  background: linear-gradient(to bottom, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  position: relative;
  border: 2px solid rgba(255, 255, 255, 0.2);
}

.gauge-center {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background-color: #67C23A;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: bold;
  transition: all 0.3s ease;
  box-shadow: 0 0 15px #67C23A;
}

.crane-status {
  margin-top: 30px;
}

.status-title {
  font-size: 16px;
  margin-bottom: 15px;
}

.status-indicators {
  display: flex;
  justify-content: space-between;
}

.status-item {
  width: 30%;
  background-color: rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  padding: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.status-item i {
  margin-right: 10px;
  font-size: 20px;
}

.status-normal {
  color: #67C23A;
  border: 1px solid #67C23A;
}

.status-warning {
  color: #F56C6C;
  border: 1px solid #F56C6C;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(245, 108, 108, 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(245, 108, 108, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(245, 108, 108, 0);
  }
}

.history-section {
  margin-top: 30px;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: rgba(255, 255, 255, 0.7);
}

.loading-container i {
  font-size: 40px;
  margin-bottom: 10px;
}

.debug-info {
  display: none;
}

.crane-location {
  background-color: rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  padding: 15px;
  margin: 20px 0;
}

.location-info {
  display: flex;
  flex-wrap: wrap;
  margin-top: 10px;
}

.location-item {
  flex: 1;
  min-width: 30%;
  margin-bottom: 10px;
  background-color: rgba(255, 255, 255, 0.05);
  padding: 10px;
  border-radius: 4px;
  margin-right: 10px;
}

.location-label {
  color: rgba(255, 255, 255, 0.7);
  margin-right: 5px;
}

.location-value {
  font-weight: bold;
  color: #409EFF;
}

.map-container {
  width: 100%;
  height: 500px;
  margin-top: 15px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

@media (max-width: 768px) {
  .stat-card {
    width: 48%;
  }
  
  .status-indicators {
    flex-direction: column;
  }
  
  .status-item {
    width: 100%;
    margin-bottom: 10px;
  }
  
  .gauge-area {
    flex-direction: column;
  }
  
  .gauge-wrapper {
    width: 100%;
    margin-bottom: 20px;
  }
}
</style> 