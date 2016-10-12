/**
 * =============================================================================
 * ************   ToolTip 工具提示   ************
 * =============================================================================
 */

mdui.Tooltip = (function () {

  /**
   * 默认参数
   */
  var DEFAULT = {
    position: 'auto',     // 提示所在位置
    delay: 0,             // 延迟，单位毫秒
    content: ''           // 提示文本，允许包含 HTML
  };

  /**
   * 设置 Tooltip 的位置
   * @param inst
   */
  function setPosition(inst) {
    var marginLeft;
    var marginTop;
    var position;

    // 触发的元素
    var targetProps = inst.target.getBoundingClientRect();

    // 触发的元素和 Tooltip 之间的距离
    var targetMargin = (mdui.support.touch ? 24 : 14);

    // Tooltip 的宽度和高度
    var tooltipWidth = inst.tooltip.offsetWidth;
    var tooltipHeight = inst.tooltip.offsetHeight;

    // Tooltip 的方向
    position = inst.options.position;

    // 自动判断位置，加 2px，使 Tooltip 距离窗口边框至少有 2px 的间距
    if (['bottom', 'top', 'left', 'right'].indexOf(position) === -1) {
      if (targetProps.top + targetProps.height + targetMargin + tooltipHeight + 2 < document.documentElement.clientHeight) {
        position = 'bottom';
      } else if (targetMargin + tooltipHeight + 2 < targetProps.top) {
        position = 'top';
      } else if (targetMargin + tooltipWidth + 2 < targetProps.left) {
        position = 'left';
      } else if (targetProps.width + targetMargin + tooltipWidth + 2 < document.documentElement.clientWidth - targetProps.left) {
        position = 'right';
      } else {
        position = 'bottom';
      }
    }

    // 设置位置
    switch (position) {
      case 'bottom':
        marginLeft = -1 * (tooltipWidth / 2);
        marginTop = (targetProps.height / 2) + targetMargin;
        break;
      case 'top':
        marginLeft = -1 * (tooltipWidth / 2);
        marginTop = -1 * (tooltipHeight + (targetProps.height / 2) + targetMargin);
        break;
      case 'left':
        marginLeft = -1 * (tooltipWidth + (targetProps.width / 2) + targetMargin);
        marginTop = -1 * (tooltipHeight / 2);
        break;
      case 'right':
        marginLeft = (targetProps.width / 2) + targetMargin;
        marginTop = -1 * (tooltipHeight / 2);
        break;
    }

    var targetOffset = $.offset(inst.target);
    inst.tooltip.style.top = targetOffset.top + (targetProps.height / 2) + 'px';
    inst.tooltip.style.left = targetOffset.left + (targetProps.width / 2) + 'px';
    inst.tooltip.style['margin-left'] = marginLeft + 'px';
    inst.tooltip.style['margin-top'] = marginTop + 'px';
  }

  /**
   * Tooltip 实例
   * @param selector
   * @param opts
   * @returns {*|string}
   * @constructor
   */
  function Tooltip(selector, opts) {
    var inst = this;

    inst.target = $.dom(selector)[0];

    // 已通过 data 属性实例化过，不再重复实例化
    var oldInst = $.getData(inst.target, 'mdui.tooltip');
    if (oldInst) {
      return oldInst;
    }

    inst.options = $.extend(DEFAULT, (opts || {}));
    inst.state = 'closed';

    // 创建 Tooltip HTML
    var guid = mdui.guid();
    inst.tooltip = $.dom('<div class="md-tooltip ' + (mdui.support.touch ? 'md-tooltip-mobile' : 'md-tooltip-desktop') + '" id="md-tooltip-' + guid + '">' + inst.options.content + '</div>')[0];
    document.body.appendChild(inst.tooltip);

    // 绑定事件
    var openEvent = mdui.support.touch ? 'touchstart' : 'mouseenter';
    var closeEvent = mdui.support.touch ? 'touchend' : 'mouseleave';
    $.on(inst.target, openEvent, function () {
      inst.open();
    });
    $.on(inst.target, closeEvent, function () {
      inst.close();
    });
  }

  /**
   * 打开 Tooltip
   * @param opts 允许每次打开时设置不同的参数
   */
  Tooltip.prototype.open = function (opts) {
    var inst = this;

    if (inst.state === 'opening' || inst.state === 'opened') {
      return;
    }

    var oldOpts = inst.options;

    // 合并 data 属性参数
    var dataOpts = $.parseOptions(inst.target.getAttribute('data-md-tooltip'));
    inst.options = $.extend(inst.options, dataOpts);

    if (opts) {
      inst.options = $.extend(inst.options, opts);
    }

    if (oldOpts.content !== inst.options.content) {
      inst.tooltip.innerHTML = inst.options.content;
    }

    setPosition(inst);

    inst.timeoutId = setTimeout(function () {
      inst.tooltip.classList.add('md-tooltip-open');
      inst.state = 'opening';
      $.pluginEvent('open', 'tooltip', inst, inst.target);

      $.transitionEnd(inst.tooltip, function () {
        inst.state = 'opened';
        $.pluginEvent('opened', 'tooltip', inst, inst.target);
      });
    }, inst.options.delay);
  };

  /**
   * 关闭 Tooltip
   */
  Tooltip.prototype.close = function () {
    var inst = this;

    clearTimeout(inst.timeoutId);
    inst.tooltip.classList.remove('md-tooltip-open');
    inst.state = 'closing';
    $.pluginEvent('close', 'tooltip', inst, inst.target);

    $.transitionEnd(inst.tooltip, function () {
      inst.state = 'closed';
      $.pluginEvent('closed', 'tooltip', inst, inst.target);
    });
  };

  /**
   * 切换 Tooltip 状态
   */
  Tooltip.prototype.toggle = function () {
    var inst = this;

    if (inst.state === 'opening' || inst.state === 'opened') {
      inst.close();
    }
    if (inst.state === 'closing' || inst.state === 'closed') {
      inst.open();
    }
  };

  /**
   * 获取 Tooltip 状态
   * @returns {'opening'|'opened'|'closing'|'closed'}
   */
  Tooltip.prototype.getState = function () {
    return this.state;
  };

  /**
   * 销毁 Tooltip
   */
  Tooltip.prototype.destroy = function () {
    var inst = this;
    clearTimeout(inst.timeoutId);
    $.removeData(inst.target, 'mdui.tooltip');
    if (typeof jQuery !== 'undefined') {
      jQuery(inst.target).removeData('mdui.tooltip');
    }
    inst.tooltip.parentNode.removeChild(inst.tooltip);
  };

  return Tooltip;

})();