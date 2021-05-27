function LatLng(Lat, Lng) {
    this.lat = Lat;
    this.lng = Lng;
    this.heading = 0;
}

LatLng.prototype.distanceTo = function(LatLngObj) {
    //IN METERS
    var EARTH_RAD_KM = 6371;

    var lat1 = this.lat.degToRad();
    var lng1 = this.lng.degToRad();
    var lat2 = LatLngObj.lat.degToRad();
    var lng2 = LatLngObj.lng.degToRad();
    var dlat = lat2 - lat1;
    var dlng = lng2 - lng1;
    var a = Math.pow(Math.sin(dlat / 2), 2) + Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin(dlng / 2), 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return EARTH_RAD_KM * c;
};

LatLng.prototype.headingTo = function(LatLngObj) {
    var dLat = (LatLngObj.lat - this.lat).degToRad();
    var dLng = (LatLngObj.lng - this.lng).degToRad();
    var y = Math.sin(dLng) *
        Math.cos(LatLngObj.lat.degToRad());
    var x = Math.cos(this.lat.degToRad()) *
        Math.sin(LatLngObj.lat.degToRad()) -
        Math.sin(this.lat.degToRad()) *
        Math.cos(LatLngObj.lat.degToRad()) *
        Math.cos(dLng);
    return Math.atan2(y, x).radToDeg().limitDegTo360();
};


Number.prototype.degToRad = function() {
    return Math.PI / 180 * this;
};

Number.prototype.radToDeg = function() {
    return 180 / Math.PI * this;
};

Number.prototype.limitDegTo360 = function() {
    return (this > 0) ? this % 360 : this + 360;
};
