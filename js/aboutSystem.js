//登录验证
CheckLogin();
function CheckLogin() {
	if (sessionStorage.Name == undefined || sessionStorage.Password == undefined) {
		alert('您还没有登录，请登录账号！');
		window.location.href = "login.html?goAddress='aboutSystem.html'";
	}
}
// 权限控制
//会话框的用户名和密码
var data = {
	Name: window.sessionStorage.Name,
	Password: window.sessionStorage.Password
};

var msg = JSON.stringify(data);
//获得用户信息，通过用户类型禁用相关导航栏
$.ajax({
	url: "http://211.149.245.105:8866/MonitorService.svc/webHttp/GetOwnInfo", //相对应的esb接口地址
	type: 'post',
	data: msg, //向服务器（接口）传递的参数
	dataType: "json",
	contentType: "application/json;charset=utf-8",
	success: function (data) {
		var otg = data.GetOwnInfoResult;
		console.log(otg);
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
//二维码显示
$(function(){

	//显示qq二维码
	$("#qqIcon").hover(function(){
		$("#qqcode").show();
	},function(){
		$("#qqcode").hide();
	});

	//显示微信二维码
	$("#weixinIcon").hover(function(){
		$("#wechat").show();
	},function(){
		$("#wechat").hide();
	});

})