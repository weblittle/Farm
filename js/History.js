//全局变量接口基地址
var BaseUrl = "http://211.149.245.105:8866/MonitorService.svc/webHttp/";
//登录验证
CheckLogin();
//登录的用户名和密码
var data = {
	Name: sessionStorage.Name,
	Password: sessionStorage.Password
};
var msg = JSON.stringify(data);
// 创建全局变量存储权限内的大棚名字和对应的大棚id
var houseInfoObj=getHouseId();

window.onload = function () {

	//当鼠标移到图表区域时，设置外边框的颜色
	$(".LineChart").hover(function () {
		$(".LineChart").css("border", '1px solid blue');
	}, function () {
		$(".LineChart").css("border", '1px solid #999999');
	});

	// 点击查询按钮时，弹窗提示
	$("#query").click(function(){
		alert("请补全选择框！");
	})
	/*------------------数据接口实现部分--------------*/

	
	//调用用户信息接口，获得用户类型，实现禁用功能
	$.ajax({
		url: BaseUrl + "GetOwnInfo", //相对应的esb接口地址
		type: 'post',
		data: msg, //向服务器（接口）传递的参数
		dataType: "json",
		contentType: "application/json;charset=utf-8",
		success: function (data) {
			var otg = data.GetOwnInfoResult;
			var userType = otg[0].UserType;
			if (userType == "游客") {
				//禁用导航栏的设置和自动控制功能
				$("#nav4,#nav6").removeAttr("onclick");
				$("#nav4 img,#nav6 img").removeAttr("onmouseover");
			}
		}
	});
	//查询条件联动效果
	$.ajax({
		url: BaseUrl + "GetOwnRights", //相对应的esb接口地址
		type: 'post',
		data: msg, //向服务器（接口）传递的参数
		dataType: "json",
		contentType: "application/json;charset=utf-8",
		success: function (result) {
			var obj = result.GetOwnRightsResult;
			var houseName = [];
			var houseId = [];
			//大棚选择框
			var selectFarm = $("#select-dapeng");
			//把权限内的大棚名字放到页面的大棚号输入框里
			for (var i = 0; i < obj.length; i++) {
				houseName[i] = obj[i].HouseName;
				houseId[i] = obj[i].GreenHouseID;
				$(selectFarm).append("<option>" + houseName[i] + "</option>");

			}
			//调用传感器实时数据接口时传递data1
			var data1 = {};
			//当大棚名字选择框改变时
			$("#select-dapeng").change(function () {
				//获得选中项的文本
				var selectedValue = $("#select-dapeng option:selected").text();
				// 获得大棚id
				for(var i=0;i<houseInfoObj.length;i++)
				{
					if(selectedValue==houseInfoObj[i].HouseName)
					{
						var houseId=houseInfoObj[i].GreenHouseID;
					}
				}				
				//调用传感器实时数据接口时传递data1
				data1 = {
					GreenHouseID: houseId
				};
				var msg1 = JSON.stringify(data1);
				$.ajax({
					url: BaseUrl + "GetSensorRealtimeData", //相对应的esb接口地址
					type: 'post',
					data: msg1, //向服务器（接口）传递的参数
					dataType: "json",
					contentType: "application/json;charset=utf-8",
					success: function (result) {
						// 全局变量
						objForSensorRealTime = result.GetSensorRealtimeDataResult;
						//清空类别框里之前的数据
						$("#leibie option:not(#firstSelect)").remove();
						//清空备注框之前的内容
						$("#remark option").text("");
						//把所有类别放到类别的选择框里
						for (var i = 0; i < objForSensorRealTime.length; i++) {
							if (i == 0) {
								//备注框里默认值
								$("#remark option").text(objForSensorRealTime[i].Remark);
							}

							$("#leibie").append("<option value="+i+">" + objForSensorRealTime[i].DeviceType + "</option>");

						}
						//当大棚名字改变时令类别选择框的值为第一个“请选择”
						$("#leibie option:eq(1)").attr("selected", "selected");
						// 当类别选择框内容改变时，更新备注中的值
						$("#leibie").change(function () {
							// 获取类别框的值，赋给备注框
							var optionValue=$("#leibie option:selected").val();
							$("#remark option").text(objForSensorRealTime[optionValue].Remark);
						})
						//为每个图表区域设置不同的id
						//某月的id
						var str1 = "0";
						var idValueForMonth = "month" + str1;
						//某日的id
						var str2 = "0";
						var idValueForDay = "day" + str2;
						// 点击查询按钮时
						$("#query").unbind('click').click(function(){}); 
						$("#query").click(function (event) {
							if ($("#select-dapeng option:selected").text()!="请选择"&&
								$("#leibie option:selected").text()!="请选择"&&
								$("#remark").text()!="")
						   	{
								// 新建图表区域
								//包含某月和某天图表的div区域
								var chartWrap = $("<div class='LineChart-wrap'></div>");
								//某月图表
								var chartForMonth = $("<div class='LineChart'></div>");
								//某日图表
								var chartForDay = $("<div class='LineChartForDay'></div>");
								//某月图表头部div标签
								var chartHeadForMonth = $("<div class='LineChart-head'></div>");
								//某日图表头部div标签
								var chartHeadForDay = $("<div class='LineChartForDay-head'></div>");
								//某月图表头部内容
								var showMonthSpan1 = $("<span id='showMonth1'></span>");
								var monthText = $("<span id='month'>月</span>");
								var showHouseNameSpan1 = $("<span id='showHouseName1'></span>");
								var deviceTypeSpan1 = $("<span id='deviceTypeInfo1'></span>");
								var btnDeleteMonth = $("<button id='chartForMonthDelete'>删除</button>");
								//内容附加到某月图表头结点
								$(chartHeadForMonth).append(showMonthSpan1);
								$(chartHeadForMonth).append(monthText);
								$(chartHeadForMonth).append(showHouseNameSpan1);
								$(chartHeadForMonth).append(deviceTypeSpan1);
								$(chartHeadForMonth).append(btnDeleteMonth);
								//某日图表头部内容
								var showMonthSpan2 = $("<span id='showMonth2'></span>");
								var dayText = $("<span id='day'>日</span>");
								var showHouseNameSpan2 = $("<span id='showHouseName2'></span>");
								var deviceTypeSpan2 = $("<span id='deviceTypeInfo2'></span>");
								var btnDeleteDay = $("<button id='chartForDayDelete'>删除</button>");
								//内容附加到某日图表头结点
								$(chartHeadForDay).append(showMonthSpan2);
								$(chartHeadForDay).append(dayText);
								$(chartHeadForDay).append(showHouseNameSpan2);
								$(chartHeadForDay).append(deviceTypeSpan2);
								$(chartHeadForDay).append(btnDeleteDay);
								//某月图表显示区域
								str1 = (parseInt(str1) + 1).toString();
								idValueForMonth = "month" + str1;
								var chartShowForMonth = $("<div  class='lineChartShowForMonth'></div>");
								$(chartShowForMonth).attr("id", idValueForMonth);
								//某日图表显示区域
								str2 = (parseInt(str2) + 1).toString();
								idValueForDay = "day" + str2;
								var chartShowForDay = $("<div  class='lineChartShowForDay'></div>");
								$(chartShowForDay).attr("id", idValueForDay);
								//进行元素之间的嵌套
								$(".lineChartBox").prepend($(chartWrap));
								$(chartWrap).append(chartForMonth);
								$(chartWrap).append(chartForDay);
								$(chartForMonth).append(chartHeadForMonth);
								$(chartForMonth).append(chartShowForMonth);
								$(chartForDay).append(chartHeadForDay);
								$(chartForDay).append(chartShowForDay);
								//获取到已被选择的类别名,找到其对应的备注名
								var selectedName = $("#leibie option:selected").text();
								//获取当前备注在数组中的索引值								
								for (var j = 0; j < objForSensorRealTime.length; j++) {
									if (objForSensorRealTime[j].DeviceType == selectedName) {
										$("#remark option").text(objForSensorRealTime[j].Remark);
										var indexSeries = j;
										break;
									}
									continue;
								}
								//当前选择的日期
								var dateValue = $("#input-month").val();
								//传递给GetSensorDayData的数据
								var dataForChart = {
									GreenHouseID: data1.GreenHouseID,
									DeviceID: objForSensorRealTime[indexSeries].DeviceID,
									DDate: dateValue
								};
								var msgForChart = JSON.stringify(dataForChart);
								$(chartForDay).hide();
								$(chartForMonth).show();
								//在图表头部显示基本信息
								$(chartForMonth).find("#showMonth1").text($("#input-month").val());
								$(chartForMonth).find("#showHouseName1").text($("#select-dapeng option:selected").text());
								$(chartForMonth).find("#deviceTypeInfo1").text("的" + $("#leibie option:selected").text() + "数据");
								//获得单位
								var unit = GetUnit($("#leibie option:selected").text(), unit);
								//获得创建的最新图表的id值
								var idValueMonth = $(chartShowForMonth).attr("id");
								var idValueDay = $(chartShowForDay).attr("id");
								//把要传递的参数放到对象里
								var infos = {
									monthId: idValueMonth,
									dayId: idValueDay,
									btnDeleteMonth: btnDeleteMonth,
									btnDeleteDay: btnDeleteDay,
									chartForMonth: chartForMonth, 
									chartForDay: chartForDay
								};
								//调用图表函数
								// DrawEChart("单位","传输给接口的数据","要传递的信息对象");
								DrawEChart(unit, dataForChart, infos);
							}
							else
							{
								alert("请补全选择框!");
							}

						});
					}
				});
			});
		}
	});
}


//根据设备类型获得对应的参数单位
// 参数:参数名,单位
function GetUnit(a, b) {
	if (a == '光照强度') {
		b = 'Lux';
	} else if (a == '空气温度' || a == '土壤温度') {
		b = '℃';
	} else {
		b = '%';
	}
	return b;
}

//画折线统计图函数
// 参数:单位,数据对象,dom图表对象
function DrawEChart(unit, datas, infoObj) {
	var houseId = datas.GreenHouseID;
	//初始化一个ECharts图表实例
	var myChart = echarts.init(document.getElementById(infoObj.monthId));

	myChart.showLoading({

		text: "图表数据正在努力加载..."

	});

	//图表配置项
	var option = {

		//网格线
		grid: {
			show: true,
			left: '70px',
			top: '20px',
			width: '653px',
			height: '192px',
			borderColor: '#666',
			backgroundColor: '#E4E4E4'
		},
		color:["#fece0e","#6ab920","#3cd7f8"],
		legend: {
			show:true,
			orient:'vertical',
			top:'20px',
			right:'10px',
			data:[
				{
					name:'最大空气温度',
					icon:'circle',
					textStyle:{
						color:'#000000',
						fontSize:14
					}
				},
				{
					name:'',
					icon:'circle',
					textStyle:{
						color:'#000000',
						fontSize:14
					}
				},
				{
					name:'',
					icon:'circle',
					textStyle:{
						color:'#000000',
						fontSize:14
					}
				}
			]
		},
		tooltip: {
			trigger:'axis'
		},
		//x轴
		xAxis: {
			show:true,
			type: 'category',
			data: [],
			name:"日",
			boundaryGap:false,
			triggerEvent: true,
			axisTick: {
				inside: true
			},
			splitLine: {
				lineStyle: {
					type: 'solid'
				}
			},
			axisLine: {
				show: false,
				lineStyle: {
					color: '#666',
					type: 'solid'
				}
			}
		},
		//y轴
		yAxis: {
			type: 'value',
			data: [],
			min: 5,
			max: 10,
			name: "°C",
			nameLocation: 'end',
			nameTextStyle: {
				color: '#999999',
				fontSize: 14,
				fontWeight: 'bold'
			},
			nameGap: 4,
			boundaryGap: false,
			axisTick: {
				inside: true,
			},
			splitLine: {
				lineStyle: {
					color: '#666',
					type: 'solid'
				}
			},
			axisLine: {
				show: false,
				lineStyle: {
					color: '#666',
					type: 'solid'
				}
			},
		},


		//系列，元素个数代表显示的线条数
		series: [{
			name: "最大空气温度",
			type: "line",
			symbolSize: 10,
			data: [],
			tooltip: {
				formatter: '{b}'+'日'+'{a}:<br>{c}' + "°C",
				position: 'top',
				backgroundColor: '#fff',
				borderColor: '#FECE0E',
				borderWidth: 1,
				textStyle: {
					color: '#FECE0E'
				}
			}
		},
		{
			name: "平均空气温度",
			type: "line",
			symbolSize: 10,
			data: [],
			tooltip: {
				formatter: '{b}'+'日'+'{a}:<br>{c}' + "°C",
				position: 'top',
				backgroundColor: '#fff',
				borderColor: '#6AB920',
				borderWidth: 1,
				textStyle: {
					color: '#6AB920'
				}
			}
		},
		{
			name: "最小空气温度",
			type: "line",
			symbolSize: 10,
			data: [],
			tooltip: {
				formatter: '{b}'+'日'+'{a}:<br>{c}' + "°C",
				position: 'top',
				backgroundColor: '#fff',
				borderColor: '#32D6FD',
				borderWidth: 1,
				textStyle: {
					color: '#32D6FD'
				}
			}
		}

		]

	};
	var msgs = JSON.stringify(datas);
	$.ajax({
		url: BaseUrl + "GetSensorDayData", //相对应的esb接口地址
		type: 'post',
		data: msgs, //向服务器（接口）传递的参数
		dataType: "json",
		contentType: "application/json;charset=utf-8",
		success: function (result) {
			//返回结果
			var otg = result.GetSensorDayDataResult;
			//获得设备类型
			var deviceType = otg[0].DeviceType;
			//创建最小值数组
			var minArray = [];
			//创建最大值变量
			var maxArray = [];
			//最大值变量
			var maxValue = "";
			//最小值变量
			var minValue = "";
			//确定x轴的坐标值
			for (var i = 0; i < otg.length; i++) {		
				option.xAxis.data[i] = otg[i].DTime;
				option.series[0].data[i] = otg[i].MaxValue;
				option.series[0].name = "最大" + otg[i].DeviceType;
				option.legend.data[0].name="最大" + otg[i].DeviceType;

				option.series[1].data[i] = otg[i].AvgValue;
				option.series[1].name = "平均" + otg[i].DeviceType;
				option.legend.data[1].name="平均" + otg[i].DeviceType;

				option.series[2].data[i] = otg[i].MinValue;
				option.series[2].name = "最小" + otg[i].DeviceType;
				option.legend.data[2].name="最小" + otg[i].DeviceType;
			
			}
			//确定y轴的值，获得最大和最小值
			for (var i = 0; i < otg.length; i++) 
			{
				if(otg[i].MinValue=="")
				{
					otg[i].MinValue=0;
				}
				if(otg[i].MaxValue=="")
				{
					otg[i].MaxValue=0;
				}
				minArray.push(parseInt(otg[i].MinValue));
				maxArray.push(parseInt(otg[i].MaxValue));
			}
			//从最小值数组中获取最小的值，从最大值数组中获取最大的值
			minArray.sort(function (a, b) { return a > b ? 1 : -1; });
			maxArray.sort(function (a, b) { return a > b ? 1 : -1; });
			//得到最小值
			minValue=minArray[0];
			//获取最大值
			maxValue = maxArray.pop();
			//设置y轴的最小值，最大值，单位名称
			option.yAxis.name = unit;
			option.yAxis.min = minValue;
			option.yAxis.max = maxValue;
			// 当月图表的x轴点击事件
			myChart.on("click", function (param) {
				//点击x轴标签时有效
				if(param.componentType=="xAxis")
				{
					// 获得大棚id
					for(var i=0;i<houseInfoObj.length;i++)
					{
						if($("#select-dapeng option:selected").text()==houseInfoObj[i].HouseName)
						{
							var houseId=houseInfoObj[i].GreenHouseID;
						}
					}
					
					var ddate =datas.DDate + "/" + param.value;
					getSensorHourData(houseId, datas.DeviceID, ddate, infoObj);
				}
			});
			myChart.hideLoading();
			myChart.setOption(option);

			//点击删除按钮时
			$(infoObj.btnDeleteMonth).click(function () {
				$(this).parent().parent().parent().remove();
			});
		}
	});
}

// 获得传感器每小时数据函数
// 参数：大棚id,设备id,日期,图表对象
function getSensorHourData(houseId, deviceId, ddate, infoObj) {

	//显示当天图表
	$(infoObj.chartForDay).show();
	var data1 = {
		GreenHouseID: houseId,
		DeviceID: deviceId,
		DDate: ddate
	};
	console.table(data1);
	var msg1 = JSON.stringify(data1);
	//调用接口
	$.ajax({
		type: "post",
		url: BaseUrl + 'GetSensorHourData',
		data: msg1,
		dataType: "json", //返回数据形式为json
		contentType: "application/json;charset=utf-8",
		success: function (result) {
			var otg = result.GetSensorHourDataResult;
			//设置当天图表的头部信息
			$(infoObj.chartForDay).find("#showMonth2").text(otg[0].DDate);
			$(infoObj.chartForDay).find("#showHouseName2").text($("#select-dapeng option:selected").text());
			$(infoObj.chartForDay).find("#deviceTypeInfo2").text("的" + otg[0].DeviceType + "数据");
			//设置图表配置项
			var myChart1 = echarts.init(document.getElementById(infoObj.dayId));
			var options = {

				//网格线
				grid: {
					show: true,
					left: '70px',
					top: '20px',
					width: '653px',
					height: '192px',
					borderColor: '#666',
					backgroundColor: '#E4E4E4'
				},
				color:["#fece0e","#6ab920","#3cd7f8"],
				//图例
				legend: {
					show:true,
					orient:'vertical',
					top:'20px',
					right:'10px',
					data:[
						{
							name:'',
							icon:'circle',
							textStyle:{
								color:'#000000',
								fontSize:14
							}
						},
						{
							name:'',
							icon:'circle',
							textStyle:{
								color:'#000000',
								fontSize:14
							}
						},
						{
							name:'',
							icon:'circle',
							textStyle:{
								color:'#000000',
								fontSize:14
							}
						}
					]
				},
				tooltip: {
					trigger:'axis'	
				},
				//x轴
				xAxis: {
					show:true,
					type: 'category',
					name:"时",
					data: [],
					boundaryGap:false,
					triggerEvent: true,
					axisTick: {
						inside: true,
					},
					splitLine: {
						lineStyle: {
							type: 'solid'
						}
					},
					axisLine: {
						show: false,
						lineStyle: {
							color: '#666',
							type: 'solid'
						}
					}
				},
				//y轴
				yAxis: {
					type: 'value',
					data: [],
					min: 5,
					max: 10,
					/*interval:5,*/
					name: "°C",
					nameLocation: 'end',
					nameTextStyle: {
						color: '#999999',
						fontSize: 14,
						fontWeight: 'bold'
					},
					nameGap: 4,
					boundaryGap: false,
					axisTick: {
						inside: true,
					},
					splitLine: {
						lineStyle: {
							color: '#666',
							type: 'solid'
						}
					},
					axisLine: {
						show: false,
						lineStyle: {
							color: '#666',
							type: 'solid'
						}
					},
				},


				//系列，元素个数代表显示的线条数
				series: [{
					name: "最大空气温度",
					type: "line",
					symbolSize: 10,
					data: [],
					tooltip: {
						formatter: '{b}'+"时"+'{a}:<br>{c}' + "°C",
						position: 'top',
						backgroundColor: '#fff',
						borderColor: '#FECE0E',
						borderWidth: 1,
						textStyle: {
							color: '#FECE0E'
						}
					}
				},
				{
					name: "平均空气温度",
					type: "line",
					symbolSize: 10,
					data: [],
					tooltip: {
						formatter: '{b}'+"时"+'{a}:<br>{c}' + "°C",
						position: 'top',
						backgroundColor: '#fff',
						borderColor: '#6AB920',
						borderWidth: 1,
						textStyle: {
							color: '#6AB920'
						}
					}
				},
				{
					name: "最小空气温度",
					type: "line",
					symbolSize: 10,
					data: [],
					tooltip: {
						formatter: '{b}'+"时"+'{a}:<br>{c}' + "°C",
						position: 'top',
						backgroundColor: '#fff',
						borderColor: '#32D6FD',
						borderWidth: 1,
						textStyle: {
							color: '#32D6FD'
						}
					}
				}
				]

			};
	
			//创建最小值数组
			var minArray = [];
			//创建最大值变量
			var maxArray = [];

			//最大值变量
			var maxValue = "";
			//最小值变量
			var minValue = "";

			//获取单位
			var unit = GetUnit($("#leibie option:selected").text(), unit);
			//确定x轴的坐标值
			for (var i = 0; i < otg.length; i++) {
				options.xAxis.data[i] = otg[i].DTime;
				options.series[0].data[i] = otg[i].MaxValue;
				options.series[0].name = "最大" + otg[i].DeviceType;
				options.legend.data[0].name="最大" + otg[i].DeviceType;

				options.series[1].data[i] = otg[i].AvgValue;
				options.series[1].name = "平均" + otg[i].DeviceType;
				options.legend.data[1].name="平均" + otg[i].DeviceType;

				options.series[2].data[i] = otg[i].MinValue;
				options.series[2].name = "最小" + otg[i].DeviceType;
				options.legend.data[2].name="最小" + otg[i].DeviceType;
	
			}

			//确定y轴的值，获得最大和最小值
			for (var i = 0; i < otg.length; i++) {

				if(otg[i].MinValue=="")
				{
					otg[i].MinValue=0;
				}
				if(otg[i].MaxValue=="")
				{
					otg[i].MaxValue=0;
				}
				minArray.push(parseInt(otg[i].MinValue));
				maxArray.push(parseInt(otg[i].MaxValue));

			}
			//从最小值数组中获取最小的值，从最大值数组中获取最大的值
			minArray.sort(function (a, b) { return a > b ? 1 : -1; });
			maxArray.sort(function (a, b) { return a > b ? 1 : -1; });
			//得到最小值
			minValue=minArray[0];
			//获取最大值
			maxValue = maxArray.pop();
			//设置y轴的最小值，最大值，单位名称
			options.yAxis.name = unit;
			options.yAxis.min = minValue;
			options.yAxis.max = maxValue;

			myChart1.setOption(options);

			//点击删除按钮时
			$(infoObj.btnDeleteDay).click(function () {
				$(this).parent().parent().hide();
			});
		}
	})
}

//登录验证函数
function CheckLogin() {
	if (sessionStorage.getItem("Name")== undefined || 
	sessionStorage.getItem("Password")== undefined) 
	{
		alert("您还没有登录，请登录账号！");
		window.location.href = "login.html?goAddress='History.html'";
	}
}
// 得到大棚id函数
function getHouseId()
{
	var obj=null;
	// var houseId="";
	$.ajax({
		url: BaseUrl + "GetOwnRights", //相对应的esb接口地址
		type: 'post',
		data: msg, //向服务器（接口）传递的参数
		dataType: "json",
		// 同步方式
		async:false,
		contentType: "application/json;charset=utf-8",
		success: function (result) {
			obj = result.GetOwnRightsResult;
			// for(var i=0;i<obj.length;i++)
			// {
			// 	if(obj[i].HouseName==houseName)
			// 	{
			// 		houseId=obj[i].GreenHouseID;
			// 	}
			// }
		}
	})
	return obj;
}
