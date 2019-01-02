//基地址
var BaseUrl = "http://211.149.245.105:8866/MonitorService.svc/webHttp/";
CheckLogin();
//登录验证函数
function CheckLogin() {
	if (window.sessionStorage.Name == undefined || window.sessionStorage.Password == undefined) {
		alert('您还没有登录，请登录账号！')
		window.location.href = "login.html?goAddress='Environmental.html'";
	}
}
//开关转换函数
function Switch(obj) {
	if (obj.className == "switch-open") {
		obj.className = "switch-close";
		obj.innerHTML = "<span class='close-bold-gray'>关</span>" +
			"<span class='close-gray'></span>";
	}
	else {
		obj.className = "switch-open";
		obj.innerHTML = "<span class='open-green'>开</span>" +
			"<span class='open-gray'></span>";
	}
}
// 传感器数据定时刷新函数
function sensorValueRealTime(houseId) {
	var dataForHouseId =
		{
			GreenHouseID: houseId
		};
	var msgForHouseId = JSON.stringify(dataForHouseId);
	// 根据备注名找到对应的传感器数据
	$.ajax({
		url: BaseUrl + "GetSensorRealtimeData", //相对应的esb接口地址
		type: 'post',
		data: msgForHouseId, //向服务器（接口）传递的参数
		dataType: "json",
		contentType: "application/json;charset=utf-8",
		success: function (data) { //服务器（接口）返回来的数据
			var otg = data.GetSensorRealtimeDataResult;
			for (var i = 0; i < otg.length; i++) {
				// 获取页面上每个传感器的备注
				var sensorName = $("#EnvironmentalState li:eq(" + i + ")").find(".sensorName").text();
				for (var j = 0; j < otg.length; j++) {
					if (otg[j].Remark == sensorName) {
						// 更新传感器数据和状态
						$("#EnvironmentalState li:eq(" + i + ")").find(".circle-span1").text(otg[j].Value);
						$("#EnvironmentalState li:eq(" + i + ")").find(".circle-span2").text(otg[j].Status);
					}
				}
			}
		}
	})
}
window.onload = function () {

	var oUl = document.getElementById('EnvironmentalState');
	//基地址
	var BaseUrl = "http://211.149.245.105:8866/MonitorService.svc/webHttp/";

	// 当鼠标移入圆形区域时,参数字体变大，移出时恢复
	$("#EnvironmentalState .circle").mouseenter(function () {
		$(this).find(".circle-span1").css("font-size", "42px");
	});
	$("#EnvironmentalState .circle").mouseleave(function () {
		$(this).find(".circle-span1").css("font-size", "34px");
	});


	//会话框的用户名和密码
	var data = {
		Name: window.sessionStorage.Name,
		Password: window.sessionStorage.Password
	};

	var msg = JSON.stringify(data);
	//获得用户信息，通过用户类型禁用相关导航栏
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
				//去掉页面的控制开关部分
				$(".env-content-right-bottom-right").css("display", "none");
				//重新设置图表的大小
				$(".env-content-right-bottom-left").css("width", "1048px")
			}
		}
	});
	//获得用户权限，得到所负责的大棚
	$.ajax({
		url: BaseUrl + "GetOwnRights", //相对应的esb接口地址
		type: 'post',
		data: msg, //向服务器（接口）传递的参数
		dataType: "json",
		contentType: "application/json;charset=utf-8",
		success: function (data) { //服务器（接口）返回来的数据					
			var otg = data.GetOwnRightsResult;
			//把权限内的大棚名字放到选择框里
			for (var i = 0; i < otg.length; i++) {
				var newOption = document.createElement("option");
				newOption.innerHTML = otg[i].HouseName;
				newOption.setAttribute("value", i);
				$("#dapengSelect").append(newOption);
				// 设置默认选中项
				$("#dapengSelect option:eq(0)").attr("selected", true);
			}


			//默认情况显示一号大棚的环境信息
			// 获取从主页面传过来的数据,用到decodeURI函数解析汉字
			var houseName = decodeURI(window.location.search.split("=")[1]);
			var houseId = "";
			if (houseName == "undefined") {
				houseId = otg[0].GreenHouseID;
			}
			else {
				// 大棚选中项为该大棚名字
				// 找到大棚名字匹配项并选中
				for (var i = 0; i < $("#dapengSelect option").length; i++) {
					if (houseName == $("#dapengSelect option:eq(" + i + ")").text()) {
						$("#dapengSelect option:eq(" + i + ")").attr("selected", true);
					}
				}
				// 找到该大棚名对应的大棚id
				for (var i = 0; i < otg.length; i++) {
					if (otg[i].HouseName == houseName) {
						houseId = otg[i].GreenHouseID;
					}
				}
			}

			var data1 = { GreenHouseID: houseId };
			var msg1 = JSON.stringify(data1);
			//获得作物信息
			$.ajax({
				url: BaseUrl + "GetCropInfo", //相对应的esb接口地址
				type: 'post',
				data: msg1, //向服务器（接口）传递的参数
				dataType: "json",
				contentType: "application/json;charset=utf-8",
				success: function (data) {
					var otg = data.GetCropInfoResult;
					//将作物信息放到页面左边栏
					$("#plantType").text(otg[0].CropName);
					$("#plantTime").text(otg[0].StartTime);
					$("#gainTime").text(otg[0].EndTime);
					$("#tempRange").text(otg[0].TempRange);
					$("#moistRange").text(otg[0].MoistRange);
					$("#manager a").text(otg[0].UserName);
					switch (otg[0].CropName) {
						case '草莓': $(".cropImg img").attr("src", "imges/head/img01.png"); break;
						case '春菠菜': $(".cropImg img").attr("src", "imges/head/img02.png"); break;
						case '郁金香': $(".cropImg img").attr("src", "imges/head/img03.png"); break;
					}

				}
			});
			//获得传感器实时数据，更新到页面
			$.ajax({
				url: BaseUrl + "GetSensorRealtimeData", //相对应的esb接口地址
				type: 'post',
				data: msg1, //向服务器（接口）传递的参数
				dataType: "json",
				contentType: "application/json;charset=utf-8",
				success: function (data) { //服务器（接口）返回来的数据		

					var otg = data.GetSensorRealtimeDataResult;
					// 根据返回结果的长度，控制左右箭头的显示
					if (otg.length > 5) {
						// 显示
						$("#img-left,#img-right").show();
					}
					else {
						$("#img-left,#img-right").hide();
					}

					if (otg.length != 0) {	//默认状态下图表显示为第一个类型的
						var unit = GetUnit(otg[0].DeviceType, unit);
						DrawEChart(data1, unit, otg[0].DeviceID);
						Timer = setInterval(function () {
							DrawEChart(data1, unit, otg[0].DeviceID);
						}, 1800000);

						//显示每个设备的环境状态信息
						for (var i = 0; i < otg.length; i++) {
							// 动态创建li元素,显示传感器信息
							var newLi = $("<li></li>");
							var newP = $("<p class='sensorName'></p>");
							var newDiv = $("<div class='circle'></div>");
							if (i == 0) {
								$(newDiv).attr("id", "firstCircle");
							}
							var newBr = $("<br>");
							var newSpan1 = $("<span class='circle-span1'></span>");
							var newSpan2 = $("<span class='circle-span2'></span>");
							var newImg = $("<img src=''>");

							$("#EnvironmentalState").append(newLi);
							$(newLi).append(newP);
							$(newLi).append(newDiv);
							$(newDiv).append(newSpan1);
							$(newDiv).append(newBr);
							$(newDiv).append(newSpan2);
							$(newDiv).append(newImg);

							if (otg[i].Status != "正常") {

								$(newDiv).css("border-color", "#ff0000");
								$(newImg).attr("src", "imges/triangle-red.png")
								$(newP).text(otg[i].Remark);
								$(newSpan1).text(otg[i].Value);
								$(newSpan2).text(otg[i].Status);
							}
							// 状态正常
							else {
								switch (otg[i].DeviceType) {
									case '土壤温度':
									case '空气温度':
									case '光照强度': $(newDiv).css("border-color", "#78BF37");
										$(newImg).attr("src", "imges/triangle-qing.png"); break;
									case '空气湿度':
									case '土壤湿度': $(newDiv).css("border-color", "#0099FF");
										$(newImg).attr("src", "imges/triangle-blue.png"); break;
								}

								$(newP).text(otg[i].Remark);
								$(newSpan1).text(otg[i].Value);
								$(newSpan2).text(otg[i].Status);
							}

						}
						// 传感器数据定时刷新
						setInterval("sensorValueRealTime('House1')", 3000);
					}
					//包含传感器数据的圆被单击时,改变图表内容
					$(".circle").click(function () {
						$(".circle img:visible").css("display", "none");
						$(this).children("img").css("display", "block");
						// 获得备注名
						var remarkName = $(this).parent().find(".sensorName").text();
						//获得设备id
						for (var i = 0; i < otg.length; i++) {
							if (otg[i].Remark == remarkName) {
								var index = i;
							}
						}
						//画图表
						var unit = GetUnit(otg[index].DeviceType, unit);
						DrawEChart(data1, unit, otg[index].DeviceID);
						Timer = setInterval(function () {
							DrawEChart(data1, unit, otg[index].DeviceID);
						}, 1800000);
					});
				}
			});

			//大棚选择项改变时，显示对应的大棚的环境信息
			$("#dapengSelect").change(function () {
				// 清除之前的数据
				$("#EnvironmentalState").text("");
				$("#linewrap").text("");

				//获取option选项的value值
				var optionValue = $("#dapengSelect option:selected").val();
				//传递不同的大棚id
				var data1 = { GreenHouseID: otg[optionValue].GreenHouseID };
				var msg1 = JSON.stringify(data1);
				//获得作物信息
				$.ajax({
					url: BaseUrl + "GetCropInfo", //相对应的esb接口地址
					type: 'post',
					data: msg1, //向服务器（接口）传递的参数
					dataType: "json",
					contentType: "application/json;charset=utf-8",
					success: function (data) {
						var otg = data.GetCropInfoResult;
						//将作物信息放到页面左边栏
						$("#plantType").text(otg[0].CropName);
						$("#plantTime").text(otg[0].StartTime);
						$("#gainTime").text(otg[0].EndTime);
						$("#tempRange").text(otg[0].TempRange);
						$("#moistRange").text(otg[0].MoistRange);
						$("#manager a").text(otg[0].UserName);
						switch (otg[0].CropName) {
							case '草莓': $(".cropImg img").attr("src", "imges/head/img01.png"); break;
							case '春菠菜': $(".cropImg img").attr("src", "imges/head/img02.png"); break;
							case '郁金香': $(".cropImg img").attr("src", "imges/head/img03.png"); break;
						}

					}
				});
				//获得传感器实时数据，更新到页面
				$.ajax({
					url: BaseUrl + "GetSensorRealtimeData", //相对应的esb接口地址
					type: 'post',
					data: msg1, //向服务器（接口）传递的参数
					dataType: "json",
					contentType: "application/json;charset=utf-8",
					success: function (data) { //服务器（接口）返回来的数据					
						var otg = data.GetSensorRealtimeDataResult;
						if (otg.length != 0) {
							var unit = GetUnit(otg[0].DeviceType, unit);
							DrawEChart(data1, unit, otg[0].DeviceID);
							Timer = setInterval(function () {
								DrawEChart(data1, unit, otg[0].DeviceID);
							}, 1800000);
							// 根据返回结果的长度，控制左右箭头的显示
							if (otg.length > 5) {
								// 显示
								$("#img-left,#img-right").show();
							}
							else {
								$("#img-left,#img-right").hide();
							}
							//显示每个设备的环境状态信息
							for (var i = 0; i < otg.length; i++) {
								// 动态创建li元素,显示传感器信息
								var newLi = $("<li></li>");
								var newP = $("<p class='sensorName'></p>");
								var newDiv = $("<div class='circle'></div>");
								if (i == 0) {
									$(newDiv).attr("id", "firstCircle");
								}
								var newBr = $("<br>");
								var newSpan1 = $("<span class='circle-span1'></span>");
								var newSpan2 = $("<span class='circle-span2'></span>");
								var newImg = $("<img src=''>");

								$("#EnvironmentalState").append(newLi);
								$(newLi).append(newP);
								$(newLi).append(newDiv);
								$(newDiv).append(newSpan1);
								$(newDiv).append(newBr);
								$(newDiv).append(newSpan2);
								$(newDiv).append(newImg);

								if (otg[i].Status != "正常") {

									$(newDiv).css("border-color", "#ff0000");
									$(newImg).attr("src", "imges/triangle-red.png")
									$(newP).text(otg[i].Remark);
									$(newSpan1).text(otg[i].Value);
									$(newSpan2).text(otg[i].Status);
								}
								// 状态正常
								else {
									switch (otg[i].DeviceType) {
										case '土壤温度':
										case '空气温度':
										case '光照强度': $(newDiv).css("border-color", "#78BF37");
											$(newImg).attr("src", "imges/triangle-qing.png"); break;
										case '空气湿度':
										case '土壤湿度': $(newDiv).css("border-color", "#0099FF");
											$(newImg).attr("src", "imges/triangle-blue.png"); break;
									}

									$(newP).text(otg[i].Remark);
									$(newSpan1).text(otg[i].Value);
									$(newSpan2).text(otg[i].Status);
								}
							}
							// 传感器数据定时刷新
							setInterval("sensorValueRealTime('House1')", 30000);
						}

						//包含传感器数据的圆被单击时,改变图表内容
						$(".circle").click(function () {
							$(".circle img:visible").css("display", "none");
							$(this).children("img").css("display", "block");
							// 获得备注名
							var remarkName = $(this).parent().find(".sensorName").text();
							//获得设备id
							for (var i = 0; i < otg.length; i++) {
								if (otg[i].Remark == remarkName) {
									var index = i;
								}
							}
							//画图表
							var unit = GetUnit(otg[index].DeviceType, unit);
							DrawEChart(data1, unit, otg[index].DeviceID);
							Timer = setInterval(function () {
								DrawEChart(data1, unit, otg[index].DeviceID);
							}, 1800000);
						});
					}
				});
			});


			//根据设备类型获得对应的参数单位
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
			//houseIdObj:包含大棚id的对象，unit:参数的单位，DeviceID:设备id
			function DrawEChart(houseIdObj, unit, DeviceID) {
				/*折线统计图*/
				var myChart = echarts.init(document.getElementById('linewrap'));
				myChart.showLoading({
					text: "图表数据正在努力加载..."
				});
				var option={
					//标题
					title: {
						text: '过去24小时的空气温度数据曲线',
						left: 'center',
						top: '30px',
						textStyle: {
							color: '#111',
							fontWeight: 'normal',
							fontSize: 14
						}
					},
					color: ["#fece0e", "#6ab920", "#3cd7f8"],
					//网格线
					grid: {
						show: true,
						left: '60px',
						width: '560px',
						height: '192px',
						borderColor: '#666',
						backgroundColor: '#E0E0E0'
					},
					//图例
					legend: {
						show: true,
						orient: 'vertical',
						top: '60px',
						right: '40px',
						data: [
							{
								name: '',
								icon: 'circle',
								textStyle: {
									color: '#000000',
									fontSize: 14
								}
							},
							{
								name: '',
								icon: 'circle',
								textStyle: {
									color: '#000000',
									fontSize: 14
								}
							},
							{
								name: '',
								icon: 'circle',
								textStyle: {
									color: '#000000',
									fontSize: 14
								}
							}
						]
					},
					//x轴
					xAxis: {
						type: 'category',
						name: "时",
						boundaryGap: false,
						data: [],
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
						min: null,
						max: null,
						name: "°C",
						nameLocation: 'end',
						nameTextStyle: {
							color: '#999999',
							fontSize: 14,
							fontWeight: 'bold'
						},
						nameGap: 10,
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
						name: "",
						type: "line",
						symbolSize: 10,
						data: [],
						tooltip: {
							formatter: '{b}' + "时" + '{a}:<br>{c}' + "°C",
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
						name: "",
						type: "line",
						symbolSize: 10,
						data: [],
						tooltip: {
							formatter: '{b}' + "时" + '{a}:<br>{c}' + "°C",
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
						name: "",
						type: "line",
						symbolSize: 10,
						data: [],
						tooltip: {
							formatter: '{b}' + "时" + '{a}:<br>{c}' + "°C",
							position: 'top',
							backgroundColor: '#fff',
							borderColor: '#32D6FD',
							borderWidth: 1,
							textStyle: {
								color: '#32D6FD'
							}
						}
					}]
				};
				//通过Ajax获取数据
				var data = {
					GreenHouseID: houseIdObj.GreenHouseID,
					DeviceID: DeviceID
				};
				var msg = JSON.stringify(data);
				var data1 = {
					GreenHouseID: houseIdObj.GreenHouseID
				};
				var msg1 = JSON.stringify(data1);
				$.ajax({
					type: "post",
					url: BaseUrl + "GetSensor24HourData",
					data: msg,
					dataType: "json", //返回数据形式为json
					contentType: "application/json;charset=utf-8",
					success: function (result) {
						var obj = result.GetSensor24HourDataResult;
						console.log(obj);
						//最小值数组
						var minArray = [];
						//最大值数组
						var maxArray = [];
						//设备类型
						var deviceType = obj[0].DeviceType;
						//获取每个时间段的最大值与最小值，放在两个不同的数组
						for (var i = 0; i < obj.length; i++) {
							if (obj[i].MinValue == "") {
								obj[i].MinValue = 0;
							}
							if (obj[i].MaxValue == "") {
								obj[i].MaxValue = 0;
							}
							minArray.push(parseInt(obj[i].MinValue));
							maxArray.push(parseInt(obj[i].MaxValue));
						}
						//将数组内的元素进行由小到大的排序
						minArray.sort(function (a, b) { return a > b ? 1 : -1; });
						maxArray.sort(function (a, b) { return a > b ? 1 : -1; });
						var minValue = minArray[0];
						var maxValue = maxArray.pop();
						var count = 0;
						$.ajax({
							type: "post",
							url: BaseUrl + "GetNormalRangeConfig",
							data: msg1,
							dataType: "json", //返回数据形式为json
							contentType: "application/json;charset=utf-8",
							success: function (data) {
								var otg = data.GetNormalRangeConfigResult;
								for (var i = 0; i < otg.length; i++) {
									if (otg[i].Name.slice(2, 6) == deviceType)
										count = i;
								}
								if (obj) {

									//将返回的category和series对象赋值给options对象内的category和series
									//因为xAxis是一个数组 这里需要是xAxis[i]的形式
									//获得最大值
									for (var i = 0; i < obj.length; i++) {
										option.xAxis.data[i] = obj[i].DTime;
										option.series[0].data[i] = obj[i].MaxValue;
										option.series[0].name = "最大" + obj[i].DeviceType;
										option.legend.data[0].name = "最大" + obj[i].DeviceType;
									}
									//获得平均值
									for (var i = 0; i < obj.length; i++) {
										option.xAxis.data[i] = obj[i].DTime;
										option.series[1].data[i] = obj[i].AvgValue;
										option.series[1].name = "平均" + obj[i].DeviceType;
										option.legend.data[1].name = "平均" + obj[i].DeviceType;
									}
									//获得最小值
									for (var i = 0; i < obj.length; i++) {
										option.xAxis.data[i] = obj[i].DTime;
										option.series[2].data[i] = obj[i].MinValue;
										option.series[2].name = "最小" + obj[i].DeviceType;
										option.legend.data[2].name = "最小" + obj[i].DeviceType;
									}
									option.yAxis.name = unit;
									option.yAxis.min = minValue;
									option.yAxis.max = maxValue;
									option.title.text = '过去24小时的' + deviceType + '数据曲线';
									myChart.hideLoading();
									myChart.setOption(option);
								}
							}
						});
					},
					error: function (errorMsg) {
						alert("不好意思，图表请求数据失败啦!");
					}
				});
			}
		}
	})

//轮播图控制左右移动
//左箭头点击事件
$("#img-left").click(function () {
	// 得到总的圆圈数
	var circleNum = $("#EnvironmentalState li").length;
	// 获取可见的左数第一个圆圈在父元素中的索引值
	var index = $("#EnvironmentalState li:visible:eq(0)").index() + 1;
	// 得到移动到的位置索引值
	var moveToIndex = circleNum - index;
	// 把第一个元素移动到倒数第一个位置，依次类推
	$("#EnvironmentalState li:visible:eq(0)").insertAfter($("#EnvironmentalState li:eq(" + moveToIndex + ")"));
});
//右箭头点击事件
$("#img-right").click(function () {

	// 获取可见的左数第一个圆圈在父元素中的索引值
	var index = $("#EnvironmentalState li:visible:eq(0)").index();
	// 得到移动到的位置索引值
	var moveToIndex = index;
	// 把最后一个元素移动到第一个位置，依次类推
	$("#EnvironmentalState li:last-child").insertBefore($("#EnvironmentalState li:eq(" + moveToIndex + ")"));
});
}





