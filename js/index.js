var BaseUrl = "http://211.149.245.105:8866/MonitorService.svc/webHttp/";

//登录验证
CheckLogin();
function CheckLogin() {
    if (sessionStorage.Name == undefined || sessionStorage.Password == undefined) {
        alert("您还没有登录，请登录账号！");
        window.location.href = "login.html?goAddress='index.html'";
    }

    GetAreaID();
}
// 获得用户负责的大棚
// param为登录的用户名和密码
function getHouseInfo(param) {
    $.ajax({
        url:"http://211.149.245.105:8866/MonitorService.svc/webHttp/GetHouseInfo", //相对应的esb接口地址
        type: 'post',
        data: param, //向服务器（接口）传递的参数
        dataType: "json",
        contentType: "application/json;charset=utf-8",
        success: function (result) {
            var obj = result.GetHouseInfoResult;
            //获得每一大棚的信息
            for (var i = 0; i < obj.length; i++) {
                //创建元素
                var newLi = $("<li class='main-li1'></li>");
                //大棚名字
                var newPHouseName = $("<p class='pHouseName'></p>");
                //显示大棚信息快
                var newDiv = $("<div class='li-content'></div>");
                //种植种类
                var newPPlantType = $("<p class='plantType'><span class='spanEle'>种植种类 :</span></p>");
                var newSpanPlantType = $("<span class='cropType'></span>");
                //收获月份
                var newPGainMonth = $("<p class='gainMonth'><span class='spanEle'>收获月份 :</span></p>");
                var newSpanGainMonth = $("<span class='gainMonthText'></span>");
                //管理员
                var newPManage = $("<p class='manager'><span class='spanEle'>管理员 :</span></p>");
                var newSpanManage = $("<span class='managerName'></span>");
                var newA = $("<a href=''></a>");
                //状态显示
                var newPWarnInfo = $("<p class='warnInfo'></p>");
                //大棚状态图标
                var imgWarn = $("<img class='warnImg'>");
                //大棚状态信息
                var newSpanWarnInfo = $("<span class='yichangInfo'></span>");
                //作物图片
                var imgCropPic = $("<img class='li-content-img'>");
                //附加元素
                $(".allHouse").append(newLi);
                //li添加子节点
                $(newLi).append(newPHouseName);
                $(newLi).append(newDiv);
                //div添加子节点
                //附加种植种类
                $(newDiv).append(newPPlantType);
                $(newPPlantType).append(newSpanPlantType);
                //附加收获月份
                $(newDiv).append(newPGainMonth);
                $(newPGainMonth).append(newSpanGainMonth);
                //附加管理员
                $(newDiv).append(newPManage);
                $(newPManage).append(newSpanManage);
                $(newSpanManage).append(newA);
                //附加警告信息
                $(newDiv).append(newPWarnInfo);
                $(newPWarnInfo).append(imgWarn);
                $(newPWarnInfo).append(newSpanWarnInfo);
                //附加作物图片
                $(newDiv).append(imgCropPic);
                //添加点击事件
                $(newDiv).click(function () {
                    // 获得大棚名字传到环境页面
                    var houseName=$(this).parent().find(".pHouseName").text();
                    window.open("Environmental.html?HouseName="+houseName+"", '_self');
                });
                //为元素填充数据
                $(newPHouseName).text(obj[i].HouseName);
                $(newSpanPlantType).text(obj[i].CropName);
                $(newA).text(obj[i].UserName);
                //收获时间
                $(newSpanGainMonth).text(obj[i].EndTime);
                //作物图片
                switch (obj[i].CropPicture) {
                    case '1':
                    case '01': $(imgCropPic).attr("src", "imges/head/img01.png"); break;                        
                    case '2':
                    case '02': $(imgCropPic).attr("src", "imges/head/img02.png"); break;                       
                    default: $(imgCropPic).attr("src", "imges/head/img03.png"); break;                        
                }                
                //判断大棚状态
                if (obj[i].Status == "异常") {
                    //显示异常信息
                    $(imgWarn).attr("src", "imges/head/img1.png");
                    $(newSpanWarnInfo).text("大棚环境指标存在异常");
                }
                else {
                    //显示正常信息
                    $(imgWarn).attr("src", "imges/head/img2.png");
                    $(newSpanWarnInfo).text("大棚各项环境指标正常");
                }
            }
        }
    })
}
//获得用户类型
function GetAreaID() {
    //会话存储的数据
    var data = {
        Name: sessionStorage.Name,
        Password: sessionStorage.Password
    }
    var msg = JSON.stringify(data);
    //根据用户名和密码获得该用户信息
    $.ajax({
        url: BaseUrl + "GetOwnInfo", //相对应的esb接口地址
        type: 'post',
        data: msg, //向服务器（接口）传递的参数
        dataType: "json",
        contentType: "application/json;charset=utf-8",
        success: function (result) {
            var obj = result.GetOwnInfoResult;
            console.log(obj);
            // 获取用户类型
            var userType = obj[0].UserType;
            // 获取大棚信息
            getHouseInfo(msg);
            //通过获得用户类型，来禁用某些功能
            if (userType == "游客") {
                $("#nav4,#nav6").removeAttr("onclick");
                $("#nav4 img,#nav6 img").removeAttr("onmouseover");
            }
        }
    });
}
