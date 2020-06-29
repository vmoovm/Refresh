/**
 * 拖动盒子
 * @param {Object} dragId
 * @param {Object} options
 */
function DragBox (dragId, options) {
	var that = this
	this.dragBox = dragId
	this.timer = null
	this.timeStamp = 0
	this.longFlag = false // 长按标志
	// 默认配置项
	this.options = {
		dragging: null,  // 拖动元素时回调函数
		dragStart: null,  // 开始拖动元素时回调函数
		dragEnd: null,  // 结束拖动元素时回调函数
		holdpress: null, // 长按元素时回调函数
		holdLong: 1000 // 长按N秒后属于长按，触发长按函数
	}
	// 合并配置项
	if (options) {
		for (s in options) {
			this.options[s] = options[s]
		}
	}
	//
	this.eventing = false // 是否正在拖动中（鼠标按下后是否弹起）
	// 以下为拖动事件***********************************************
	this.startX = 0 // 开始坐标x
	this.startY = 0 // 开始坐标y
	this.endX = 0 // 结束坐标x
	this.endY = 0 // 结束坐标y
	this.oLeft = null // 该元素在页面位置offsetLeft
	this.oTop =  null // 该元素在页面位置offsetTop
	/**
	 * 鼠标按下事件
	 * @param {Object} e
	 */
	this._down_hander = function (e) {
		
		that.eventing = true
		that.longFlag = false
		that.dragBox.addEventListener('touchmove', that._move_hander, false)
		that.dragBox.addEventListener('touchend', that._up_hander, false)
		that.startX = e.targetTouches[0].pageX
		that.startY = e.targetTouches[0].pageY
		that.endX = e.targetTouches[0].pageX
		that.endY = e.targetTouches[0].pageY
		that.oLeft = that.dragBox.offsetLeft
		that.oTop = that.dragBox.offsetTop
		
		
		
		
		// 触发开始拖动回调
		if (that.options.dragStart) {
			// 返回值
			var obj = {
				evt: e,  // event / e
				startX: that.startX,
				startY: that.startY,
				endX: that.endX,  // 滑动后当前坐标x
				endY: that.endY,  // 滑动后当前坐标y
				moveX: that.endX - that.startX,  // x移动的长度
				moveY: that.endX - that.startY,  // y移动的长度
				siteX: that.startX - that.oLeft,  // x坐标距该元素left边缘的长度
				siteY: that.startY - that.oTop,  // y坐标距该元素top边缘的长度
				that: that, // 本对象
				self: that.dragBox  // 当前移动的元素
			}
			that.options.dragStart(obj)
			
			// 长按判断
			that.timeStamp = new Date() * 1
			that.timer = setInterval(function () {
				if ((new Date() * 1 - that.timeStamp) > that.options.holdLong) {
					if (that.options.holdpress) {
						that.options.holdpress(obj)
						if (that.timer) clearInterval(that.timer)
						that.longFlag = true  // 以后均为长按操作
					}
				}
			}, 50)
		}
	}
	
	/**
	 * 鼠标移动事件
	 * @param {Object} e
	 */
	this._move_hander = function (e) {
		e.preventDefault()
		if (!that.eventing) return
		that.dragBox.removeEventListener('touchstart', that._down_hander)
		// that.dragBox.style.top = ty + my + 'px'
		that.endX = e.targetTouches[0].pageX
		that.endY = e.targetTouches[0].pageY		
		// 返回值
		var obj = {
			evt: e,  // event / e
			startX: that.startX,
			startY: that.startY,
			endX: that.endX,  // 滑动后当前坐标x
			endY: that.endY,  // 滑动后当前坐标y
			moveX: that.endX - that.startX,  // x移动的长度
			moveY: that.endY - that.startY,  // y移动的长度
			siteX: that.endX - that.oLeft,  // x坐标距该元素left边缘的长度
			siteY: that.endY - that.oTop,  // y坐标距该元素top边缘的长度
			that: that, // 本对象
			self: that.dragBox,  // 当前移动的元素
			holdLong: that.longFlag // 是否为长按后的操作
		}
		// 防抖长按
		if (that.timer && (Math.abs(obj.moveX) > 2 || Math.abs(obj.moveY) > 2)) clearInterval(that.timer)
		
		// that.dragBox.addEventListener('touchend', that._up_hander, false)
		if (window.innerWidth - 5 == e.clientX || window.innerHeight - 5  == e.clientY || 5 >= e.clientX || 5 >= e.clientY) {
			that.dragBox.removeEventListener('touchmove', that._move_hander)
			that.dragBox.addEventListener('touchstart', that._down_hander, false)
		}
		
		// 触发移动回调
		if (that.options.dragging) that.options.dragging(obj)
	}
	
	/**
	 * 鼠标弹起事件
	 * @param {Object} e
	 */
	this._up_hander = function (e) {
		if (that.timer) clearInterval(that.timer)
		// if (!that.eventing) return
		// 返回值
		var obj = {
			evt: e,  // event / e
			startX: that.startX,
			startY: that.startY,
			endX: that.endX,  // 滑动后当前坐标x
			endY: that.endY,  // 滑动后当前坐标y
			moveX: that.endX - that.startX,  // x移动的长度
			moveY: that.endX - that.startY,  // y移动的长度
			siteX: that.endX - that.dragBox.offsetLeft,  // x坐标距该元素left边缘的长度
			siteY: that.endY - that.dragBox.offsetTop,  // y坐标距该元素top边缘的长度
			that: that, // 本对象
			self: that.dragBox,  // 当前移动的元素
			holdLong: that.longFlag // 是否为长按后的操作
		}
		// 触发结束回调
		if (that.options.dragEnd) that.options.dragEnd(obj)
		that.eventing = false
		that.dragBox.removeEventListener('touchmove', that._move_hander)
		that.dragBox.removeEventListener('touchend', that._up_hander)
		that.dragBox.addEventListener('touchstart', that._down_hander, false)
	}

	// 绑定拖拽
	this.dragBox.addEventListener('touchstart', that._down_hander, false)
	
	// 消毁对象时为彻底消毁事件，不消毁事件会造成同一元素绑定多次事件
	this.destroy = function () {
		this.dragBox.removeEventListener('touchstart', that._down_hander, false)
	}
}