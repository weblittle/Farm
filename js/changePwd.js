//接口基地址
var baseUrl="http://211.149.245.105:8866/MonitorService.svc/webHttp/";

window.onload=function(){

	var data={
		Name: sessionStorage.Name,
		Password: sessionStorage.Password
	};
	var msg=JSON.stringify(data);
	//获取用户个人信息
	$.ajax({
		url:baseUrl+"GetOwnInfo",
		type:"post",
		data:msg,
		dataType:"json",
		contentType:"application/json;charset=utf-8",
		success:function(result)
		{
			var obj=result.GetOwnInfoResult;
			// 游客禁用某些功能
			if (obj[0].UserType == "游客") {
                $("#nav4,#nav6").removeAttr("onclick");
				$("#nav4 img,#nav6 img").removeAttr("onmouseover");
			}
		}
	})
	//当点击下一步时
	$("#next").click(function(){

		//旧密码
		var oldPwd=$("#oldPwd").val();
		//新密码
		var newPwd=$("#newPwd").val();
		
		//新密码用正则表达式验证
		// var reg=/^(?![0-9]+$)(?![a-zA-Z]+$)[0-9a-zA-Z]{8,}/;
		
		var dataForChangePwd={
			Name:data.Name,
			OldPassword:oldPwd,
			NewPassword:newPwd
		};
		var msgForChangePwd=JSON.stringify(dataForChangePwd);

		//调用接口，更改密码
		$.ajax({
			url:baseUrl+"ResetPWD",
			type:"post",
			data:msgForChangePwd,
			dataType:"json",
			contentType:"application/json;charset=utf-8",
			success:function(result){
				var obj=result.ResetPWDResult;
				//若更改成功
				if(obj)
				{
					//隐藏更改密码内容，显示成功界面
					$(".changePwdBefore").hide();
					$(".changePwdAfter").show();
					//点击按钮“马上登陆试试”
					$("#loginTest").click(function(){
						location.href="login.html";
					});
				}
				
			}
		})

	})
}