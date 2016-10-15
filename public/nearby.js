function removeHTMLTag(str) {
	str = str.replace(/<\/?[^>]*>/g,''); //去除HTML tag
	str = str.replace(/[ | ]*\n/g,'\n'); //去除行尾空白
	//str = str.replace(/\n[\s| | ]*\r/g,'\n'); //去除多余空行
	str=str.replace(/&nbsp;/ig,'');//去掉&nbsp;
	return str;
}
function computeDistance(startCoords, destCoords) {
	try {
		var startLatRads = degreesToRadians(startCoords.latitude);
		var startLongRads = degreesToRadians(startCoords.longitude);
		var destLatRads = degreesToRadians(destCoords.latitude);
		var destLongRads = degreesToRadians(destCoords.longitude);

		var Radius = 6371; // radius of the Earth in km
		var distance=Math.acos(Math.sin(startLatRads)*Math.sin(destLatRads) +
				Math.cos(startLatRads) * Math.cos(destLatRads) *
				Math.cos(startLongRads - destLongRads)) * Radius;

		return distance;
	} catch(e) {
		return -1;
	}
}

function getCookie(c_name) {
	if (document.cookie.length>0) {
		c_start=document.cookie.indexOf(c_name + "=")
		if (c_start!=-1) {
			c_start=c_start + c_name.length+1
			c_end=document.cookie.indexOf(";",c_start)
			if (c_end==-1) c_end=document.cookie.length
			return unescape(document.cookie.substring(c_start,c_end))
		}
	}
	return undefined;
}
function setCookie(cname, cvalue, exdays) {
	var d = new Date();
	d.setTime(d.getTime() + (exdays*24*60*60*1000));
	var expires = "expires="+d.toUTCString();
	document.cookie = cname + "=" + cvalue + "; " + expires;
}
function sendMsg(name, content, id = '', choice=[], rebot) {
	data = {
		'name': name,
		'content': content,
		'choice': choice,
		'id': id,
		'GPS': GPS,
		'robot': false,
	};
	socket.emit('chat message', data);
}
function onClickChoice(id, choice) {
	$('.' + id).addClass('inactive');
	$('.' + id + ' button').removeAttr('onclick');
	$('.' + id + ' button').attr('disabled', true);
	sendMsg(name, choice, id);
}
function onReceiveMsg(msg) {
	msg.name = removeHTMLTag(msg.name);
	msg.content = removeHTMLTag(msg.content);
	var dis = computeDistance(msg.GPS, GPS);
	if (dis > 2) return;
	var t = '<div class="message_box">';
	t += '<div class="username">';
	if (msg.robot) t+= '<span class="label label-success">Robot</span> ';
	t += msg.name + ':&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;';
	if (dis <= 1) t += '1km内';
	else t += '约' + Math.floor(dis) + 'km';
	t += '</div>';
	t += '<div class="content">' + msg.content + '</div>';
	if (msg.choice!=[]) {
		t += '<div class="choices ' + msg.id + '">';
		msg.choice.map(function(element, index) {
			t += '<button class="btn btn-default" onclick="onClickChoice(\'' + msg.id + '\', \'' + element + '\')">' + element + '</button>';
		})
		t += '</div>';
	}
	t += '</div>';
	var endSig = $('#messages').height() - $('#messagesContainer').height() + 110 < 0 || $("#messagesContainer").scrollTop() == $('#messages').height() - $('#messagesContainer').height() + 110;
	$('#messages').append(t);
	if (endSig) $("#messagesContainer").animate({"scrollTop": $('#messages').height() - $('#messagesContainer').height() + 110}, "slow");
}
function onchangeEdit() {
	if ($('#nameContainer').hasClass('edit')) {
		$('#nameContainer').removeClass('edit');
		setName($('#nameEdit').val());
	} else {
		$('#nameContainer').addClass('edit')
	}
}
function setName(c_name) {
	name = c_name;
	$('#name').html(c_name);
	$('#nameEdit').val(c_name);
	setCookie('name', c_name, 30);
}
function init() {
	socket.on('chat message', onReceiveMsg);
	$('#sendForm').submit(function(){
		var content = $('#content').val();
		if (content) sendMsg(name, content);
		$('#content').val('');
		return false;
	});
	t = getCookie('name');
	var first_flag = false;
	if (t == undefined) {
		name = '长寿的青蛙';
		first_flag = true;
		setName('长寿的青蛙');
	} else setName(t);
	if (first_flag){
		onReceiveMsg({
			'name': 'Nearby Assistant',
			'content': 'Hello ' + name + '! 这是您第一次使用Nearby，请允许我做一下自我介绍吧。',
			'choice': [],
			'id': '',
			'GPS': GPS,
			'robot': true,
		});
		onReceiveMsg({
			'name': 'Nearby Assistant',
			'content': 'Nearby是一个基于地理位置与物联网络的平台，您可以轻而易举地与方圆500米范围内的朋友们自由交流，擦肩而过皆为缘，希望您能够找到更多的人生乐趣所在！',
			'choice': [],
			'id': '',
			'GPS': GPS,
			'robot': true,
		});
		onReceiveMsg({
			'name': 'Nearby Assistant',
			'content': 'Nearby的平台上，不仅是强地理关系下的人际网络，更是围绕您服务的物联中心。可能您在这里的一言一行，都会被周围的IOT设备识别，进而使它们为您提供更优秀的生活服务呢。Nearby的神奇之处，还有很多，说不定就在一句话，或者一个词，字字珠玑哦。',
			'choice': [],
			'id': '',
			'GPS': GPS,
			'robot': true,
		});
	} else
		onReceiveMsg({
			'name': 'Nearby Assistant',
			'content': 'Hello ' + name + '! 欢迎回来！',
			'choice': [],
			'id': '',
			'GPS': GPS,
			'robot': true,
		});
}

var name = undefined;
var socket = io();
init();
$('body > div').removeClass('inactive');

// GPS data saver
var GPS = {
	'latitude': 31.1748534,
	'longitude': 121.4024798,
};
var id, target, options;

function success(pos) {
	var crd = pos.coords;
	GPS = crd;
}

function error(err) {
	console.warn('ERROR(' + err.code + '): ' + err.message);
}

options = {
	enableHighAccuracy: true,
	timeout: 5000,
	maximumAge: 0
};

id = navigator.geolocation.watchPosition(success, error, options);

setInterval(navigator.geolocation.watchPosition(success, error, options), 30000);
