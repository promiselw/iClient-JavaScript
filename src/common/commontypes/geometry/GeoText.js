import {SuperMap} from '../../SuperMap';
import {Geometry} from '../Geometry';
import {Bounds} from '../Bounds';
import {Util} from '../Util';
import {Point} from './Point';
import './LineString';
import '../Pixel';
import '../LonLat';

/**
 * @class SuperMap.Geometry.GeoText
 * @classdesc 文本标签类。
 * @extends {SuperMap.Geometry}
 * @param x {float} x-坐标，必设参数。
 * @param y {float} y-坐标，必设参数。
 * @param text {string} 标签中的文本内容，必设参数。
 */
export class GeoText extends Geometry {

    constructor(x, y, text) {
        super(x, y, text);
        /**
         * @member SuperMap.Geometry.GeoText.prototype.x -{float}
         * @description 横坐标。
         */
        this.x = parseFloat(x);

        /**
         * @member SuperMap.Geometry.GeoText.prototype.y -{float}
         * @description 纵坐标。
         */
        this.y = parseFloat(y);

        /**
         * @member SuperMap.Geometry.GeoText.prototype.text -{string}
         * @description 标签中的文本内容。
         */
        this.text = text.toString();

        /**
         * @member SuperMap.Geometry.GeoText.prototype.bsInfo -{Object}
         * @description 标签范围的基础信息，包含下面2个属性。
         *  * w: bounds 的宽；
         *  * h: bounds 的高度；

         */
        this.bsInfo = {
            "h": null,
            "w": null
        };
        this.element = document.createElement('span');
        this.CLASS_NAME = "SuperMap.Geometry.GeoText";
    }

    /**
     * @function SuperMap.Geometry.GeoText.prototype.destroy
     * @description 销毁文本标签类。
     */
    destroy() {
        super.destroy();
        this.x = null;
        this.y = null;
        this.text = null;
    }

    /**
     * @function SuperMap.Geometry.GeoText.prototype.getCentroid
     * @description 获取标签对象的质心。
     * @return {SuperMap.Geometry.Point} 标签对象的质心。
     */
    getCentroid() {
        return new Point(this.x, this.y);
    }

    /**
     * @function SuperMap.Geometry.GeoText.prototype.clone
     * @description 克隆标签对象。
     * @returns {SuperMap.Geometry.GeoText} 克隆后的标签对象。
     */
    clone(obj) {
        if (obj == null) {
            obj = new GeoText(this.x, this.y, this.text);
        }
        Util.applyDefaults(obj, this);
        return obj;
    }

    /**
     * @function SuperMap.Geometry.GeoText.prototype.calculateBounds
     * @description 计算标签对象的范围。
     */
    calculateBounds() {
        this.bounds = new Bounds(this.x, this.y,
            this.x, this.y);
    }

    /**
     * @function SuperMap.Geometry.GeoText.prototype.getLabelPxBoundsByLabel
     * @description 根据绘制好的标签获取文字标签的像素范围，参数的单位是像素；此方法相对于 getLabelPxBoundsByText 效率较低，但支持所有格式的文本。
     * @param locationPixel - {Object} 标签的位置点，该对象含有属性x(横坐标)，属性y(纵坐标)。
     * @param labelWidth - {string} 标签的宽度，如：“90px”。
     * @param labelHeight - {string}  标签的高度。
     * @param style - {Object}  标签的style。
     * @return {SuperMap.Bounds}  标签的像素范围。
     */
    getLabelPxBoundsByLabel(locationPixel, labelWidth, labelHeight, style) {
        var labelPxBounds, left, bottom, top, right;
        var locationPx = Util.cloneObject(locationPixel);

        //计算文本行数
        var theText = style.label || this.text;
        var textRows = theText.split('\n');
        var laberRows = textRows.length;

        //处理文字对齐
        labelWidth = parseFloat(labelWidth);
        labelHeight = parseFloat(labelHeight);
        if (laberRows > 1) {
            labelHeight = parseFloat(labelHeight) * laberRows;
        }
        if (style.labelAlign && style.labelAlign !== "cm") {
            switch (style.labelAlign) {
                case "lt":
                    locationPx.x += labelWidth / 2;
                    locationPx.y += labelHeight / 2;
                    break;
                case "lm":
                    locationPx.x += labelWidth / 2;
                    break;
                case "lb":
                    locationPx.x += labelWidth / 2;
                    locationPx.y -= labelHeight / 2;
                    break;
                case "ct":
                    locationPx.y += labelHeight / 2;
                    break;
                case "cb":
                    locationPx.y -= labelHeight / 2;
                    break;
                case "rt":
                    locationPx.x -= labelWidth / 2;
                    locationPx.y += labelHeight / 2;
                    break;
                case "rm":
                    locationPx.x -= labelWidth / 2;
                    break;
                case "rb":
                    locationPx.x -= labelWidth / 2;
                    locationPx.y -= labelHeight / 2;
                    break;
                default:
                    break;
            }
        }

        this.bsInfo.h = labelHeight;
        this.bsInfo.w = labelWidth;

        //bounds的四边
        left = locationPx.x - parseFloat(labelWidth) / 2;
        bottom = locationPx.y + parseFloat(labelHeight) / 2;
        right = locationPx.x + parseFloat(labelWidth) / 2;
        top = locationPx.y - parseFloat(labelHeight) / 2;

        labelPxBounds = new Bounds(left, bottom, right, top);

        return labelPxBounds;
    }

    /**
     * @function SuperMap.Geometry.GeoText.prototype.getLabelPxBoundsByText
     * @description 根据文本内容获取文字标签的像素范围
     * @param locationPixel - {Object} 标签的位置点，该对象含有属性x(横坐标)，属性y(纵坐标)。
     * @param style - {Object} 标签的样式
     * @return {SuperMap.Bounds}  标签的像素范围。
     */
    getLabelPxBoundsByText(locationPixel, style) {
        var labelPxBounds, left, bottom, top, right;
        var labelSize = this.getLabelPxSize(style);
        var locationPx = Util.cloneObject(locationPixel);

        //处理文字对齐
        if (style.labelAlign && style.labelAlign !== "cm") {
            switch (style.labelAlign) {
                case "lt":
                    locationPx.x += labelSize.w / 2;
                    locationPx.y += labelSize.h / 2;
                    break;
                case "lm":
                    locationPx.x += labelSize.w / 2;
                    break;
                case "lb":
                    locationPx.x += labelSize.w / 2;
                    locationPx.y -= labelSize.h / 2;
                    break;
                case "ct":
                    locationPx.y += labelSize.h / 2;
                    break;
                case "cb":
                    locationPx.y -= labelSize.h / 2;
                    break;
                case "rt":
                    locationPx.x -= labelSize.w / 2;
                    locationPx.y += labelSize.h / 2;
                    break;
                case "rm":
                    locationPx.x -= labelSize.w / 2;
                    break;
                case "rb":
                    locationPx.x -= labelSize.w / 2;
                    locationPx.y -= labelSize.h / 2;
                    break;
                default:
                    break;
            }
        }

        this.bsInfo.h = labelSize.h;
        this.bsInfo.w = labelSize.w;


        left = locationPx.x - labelSize.w / 2;
        bottom = locationPx.y + labelSize.h / 2;
        //处理斜体字
        if (style.fontStyle && style.fontStyle === "italic") {
            right = locationPx.x + labelSize.w / 2 + parseInt(parseFloat(style.fontSize) / 2);
        } else {
            right = locationPx.x + labelSize.w / 2;
        }
        top = locationPx.y - labelSize.h / 2;

        labelPxBounds = new Bounds(left, bottom, right, top);

        return labelPxBounds;
    }

    /**
     * @function SuperMap.Geometry.GeoText.prototype.getLabelPxSize
     * @description 获取label的像素大小
     * @param style - {Object} 标签样式。
     * @return {Object} 标签大小对象，属性w表示标签的宽度，属性h表示标签的高度。
     */
    getLabelPxSize(style) {
        var text,//文本内容
            fontSize,//字体大小
            spacing = 1,//两个字符间的间距（单位：px）
            lineSpacing = 0.2,
            bgstrokeWidth = parseFloat(style.strokeWidth);//标签背景框边框的宽度

        text = style.label || this.text;
        if (style.fontSize) {
            fontSize = parseFloat(style.fontSize);
        } else {
            fontSize = parseFloat("12px");
        }

        //标签宽高
        var labelW, labelH;

        var textRows = text.split('\n');
        var numRows = textRows.length;

        if (numRows > 1) {
            labelH = fontSize * numRows + numRows + bgstrokeWidth + lineSpacing * fontSize;
        } else {
            labelH = fontSize + bgstrokeWidth + lineSpacing * fontSize + 1;
        }

        //取最大宽度
        labelW = 0;
        if (this.labelWTmp && labelW < this.labelWTmp) {
            labelW = this.labelWTmp;
        }
        for (var i = 0; i < numRows; i++) {
            var textCharC = this.getTextCount(textRows[i]);
            var labelWTmp = this.labelWTmp = Util.getTextBounds(style, textRows[i], this.element).textWidth + textCharC.textC * spacing + bgstrokeWidth;
            if (labelW < labelWTmp) {
                labelW = labelWTmp;
            }
        }

        var labelSize = new Object(); //标签大小
        labelSize.h = labelH;
        labelSize.w = labelW;

        return labelSize;
    }

    /**
     * @function SuperMap.Geometry.GeoText.prototype.getTextCount
     * @description 获取text中的字符个数。
     * @param text - {string} 字符串。
     * @return {Object} 字符个数统计结果，属性cnC表示中文字符个数，属性enC表示英文字符个数，属性textC表示字符总个数。
     */
    getTextCount(text) {
        var textCharCount = {};

        var cnCount = 0;
        var enCount = 0;

        for (var i = 0; i < text.length; i++) {
            if (text.charCodeAt(i) > 255) { //遍历判断字符串中每个字符的Unicode码,大于255则为中文
                cnCount++;
            } else {
                enCount++;
            }
        }
        //中午字符个数
        textCharCount.cnC = cnCount;
        //英文字符个数
        textCharCount.enC = enCount;
        //字符总个数
        textCharCount.textC = text.length;

        return textCharCount;
    }


}

SuperMap.Geometry.GeoText = GeoText;