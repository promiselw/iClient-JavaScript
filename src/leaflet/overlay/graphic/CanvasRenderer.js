import L from "leaflet";

const emptyFunc = L.Util.falseFn;
export var GraphicCanvasRenderer = L.Class.extend({
    initialize: function (layer, options) {
        this.layer = layer;
        options = options || {};
        L.Util.setOptions(this, options);
    },

    /**
     * @private
     * @function  GraphicCanvasRenderer.prototype.getRenderer
     * @description 返回渲染器给图层，提供图层后续的数据增删改。
     * @returns {L.Canvas}
     */
    getRenderer: function () {
        return this.options.renderer;
    },

    /**
     * @private
     * @function  GraphicCanvasRenderer.prototype.update
     * @description  更新图层，数据或者样式改变后调用。
     */
    update: function (graphics) {
        this.layer._update(graphics);
    },

    _handleClick: function (evt) {
        let me = this,
            layer = me.layer,
            map = layer._map;
        if (!layer.options.onClick) {
            return;
        }
        this.layer._renderer._ctx.canvas.style.cursor = "pointer";
        let graphics = layer._getGraphicsInBounds();
        for (let i = 0; i < graphics.length; i++) {
            let p1, p2, bounds;
            let center = map.latLngToLayerPoint(graphics[i].getLatLng());
            let style = graphics[i].getStyle();
            if (!style && this.defaultStyle) {
                style = this.defaultStyle;
            }
            if (style.img) {
                p1 = L.point(center.x - style.img.width / 2, center.y - style.img.height / 2);
                p2 = L.point(center.x + style.img.width / 2, center.y + style.img.height / 2);
            } else {
                p1 = L.point(center.x - style.width / 2, center.y - style.height / 2);
                p2 = L.point(center.x + style.width / 2, center.y + style.height / 2);
            }
            bounds = L.bounds(p1, p2);
            if (bounds.contains(map.latLngToLayerPoint(evt.latlng))) {
                return layer.options.onClick.call(layer, graphics[i]);
            }
        }
    },

    //跟GraphicWebGLRenderer保持一致
    _clearBuffer: emptyFunc
});

L.Canvas.include({

    drawGraphics: function (graphics, defaultStyle) {
        var me = this;
        me._ctx.clearRect(0, 0, me._ctx.canvas.width, me._ctx.canvas.height);
        graphics.forEach(function (graphic) {
            var style = graphic.getStyle();
            if (!style && defaultStyle) {
                style = defaultStyle;
            }
            if (style.img) { //绘制图片
                me._drawImage.call(me, me._ctx, style, graphic.getLatLng());
            } else { //绘制canvas
                me._drawCanvas.call(me, me._ctx, style, graphic.getLatLng());
            }
        })
    },

    _drawCanvas: function (ctx, style, latLng) {

        var canvas = style;
        var pt = this._map.latLngToLayerPoint(latLng);
        var p0 = pt.x - canvas.width / 2;
        var p1 = pt.y - canvas.height / 2;
        var width = canvas.width;
        var height = canvas.height;

        ctx.drawImage(canvas, p0, p1, width, height);
    },

    _drawImage: function (ctx, style, latLng) {
        //设置图片的大小
        var width, height;
        if (style.size) {
            var size = style.size;
            width = size[0];
            height = size[1];
        } else {
            width = style.img.width;
            height = style.img.height;
        }
        //设置偏移
        var point = this._coordinateToPoint(latLng);

        var pt = L.point(point),
            ac = L.point(style.anchor);
        point = [pt.x - ac.x, pt.y - ac.y];

        //参数分别为：图片，图片裁剪下x,y位置，裁剪长宽，放置在画布的位置x,y, 占取画布长宽
        //ctx.drawImage(style.img, 0, 0, width, height, point[0], point[1], width, height);
        ctx.drawImage(style.img, point[0], point[1], width, height);
    },

    _coordinateToPoint: function (coordinate) {
        if (!this._map) {
            return coordinate;
        }
        var latLng = coordinate;
        if (L.Util.isArray(coordinate)) {
            latLng = L.latLng(coordinate[0], coordinate[1]);
        } else if (coordinate instanceof L.LatLng) {
            latLng = L.latLng(coordinate.lat, coordinate.lng);
        }
        var point = this._map.latLngToLayerPoint(latLng);
        return [point.x, point.y];
    }

});