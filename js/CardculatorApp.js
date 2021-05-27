// CardculatorApp is an OBJECT
function CardculatorApp() {

    // Constants
    this.AVERAGE_FLIGHT_COST = 392;
    this.MONTHS_PER_YEAR = 12;

    this.FLIGHTS_POINTS = 3;
    this.GROCERIES_POINTS = 3;
    this.RESTAURANTS_POINTS = 2;

    this.KM_RADIUS_THRESHOLD = 650; // ~ 400 miles

    // Location input (i.e. "BOS")
    this.$location = $("#location");

    // Sliders (INPUTS)
    this.$numberOfFlights = $("#numberOfFlights");
    this.$monthlyGroceriesSpend = $("#monthlyGroceriesSpend");
    this.$monthlyRestaurantsSpend = $("#monthlyRestaurantsSpend");

    // $$ Per year estimate (OUTPUTS)
    this.$flightsSpendPerYear = $("#flightsSpendPerYear");
    this.$groceriesSpendPerYear = $("#groceriesSpendPerYear");
    this.$restaurantsSpendPerYear = $("#restaurantsSpendPerYear");

    // Total points per year (OUTPUTS)
    this.$flightsPointsPerYear = $("#flightsPointsPerYear");
    this.$groceriesPointsPerYear = $("#groceriesPointsPerYear");
    this.$restaurantsPointsPerYear = $("#restaurantsPointsPerYear");

    // Total TrueBlue Points (OUTPUT)
    this.$grandTotalPoints = $("#grandTotalPoints");

    // Contains the trips you can take (OUTPUT)
    this.$tripContainer = $("#trip-container");
    this.$deal0 = $("#deal0");
    this.$deal1 = $("#deal1");
    this.$deal2 = $("#deal2");
    this.$deal3 = $("#deal3");
    this.$deal4 = $("#deal4");
    this.$deal5 = $("#deal5");


    this.dataJSON = null;
    this.dealsJSON = null;
    this.affordableDealsArray = [];

    this.loadDealsFeed();

}


// Get JSON of all info on JetBlue flights
CardculatorApp.prototype.loadDealsFeed = function() {
    var _this = this;
    $.get('https://jsonp.afeld.me/?url=http://jbdealsfeed.jetblue.com/api/Deals/', function(data) {
        _this.initApp(data);
    });
};


// Start app after the deals feed loads
CardculatorApp.prototype.initApp = function(data) {
    var _this = this;
    this.dataJSON = data;
    this.dealsJSON = data.Deals;

    // When any of the 3 input fields are changed, calculate all 3 point totals again
    this.$numberOfFlights.on("input", function() {
        _this.calculatePoints();
    });
    this.$monthlyGroceriesSpend.on("input", function() {
        _this.calculatePoints();
    });
    this.$monthlyRestaurantsSpend.on("input", function() {
        _this.calculatePoints();
    });

    // If an input is left blank, make it 0
    this.$numberOfFlights.on("blur", function() {
        if (_this.$numberOfFlights.val() === "") {
            _this.$numberOfFlights.val(0);
        }
    });
    this.$monthlyGroceriesSpend.on("blur", function() {
        if (_this.$monthlyGroceriesSpend.val() === "") {
            _this.$monthlyGroceriesSpend.val(0);
        }
    });
    this.$monthlyRestaurantsSpend.on("blur", function() {
        if (_this.$monthlyRestaurantsSpend.val() === "") {
            _this.$monthlyRestaurantsSpend.val(0);
        }
    });

    // Calculate all points when the page loads
    this.calculatePoints();

};

// To make sure that the JetBlue list of airports matches the airports in AirportCodes.js
CardculatorApp.prototype.checkForLocationMatches = function() {
    for (var i = 0; i < this.dealsJSON.length; i++) {

        var jsonAirportCode = this.dealsJSON[i].Origin.AirportCode;

        for (var j = 0; j < AIRPORT_ARRAY.length; j++) {

            var globalAirportCode = AIRPORT_ARRAY[j].airportCode;

            if (jsonAirportCode == globalAirportCode) {
                // console.log("LAT LON MATCH FOR:", jsonAirportCode);
                break;

            } else if (j == AIRPORT_ARRAY.length - 1) {
                console.log("!!!!!!! NO LAT LON MATCH FOR:", jsonAirportCode);
            }
        }
    }
};


// Calculations for the points for...everything
CardculatorApp.prototype.calculatePoints = function() {
    this.localDealsArray = this.getLocalDealsArray();

    // Get vals of input fields
    var _numberOfFlights = this.$numberOfFlights.val();
    var _monthlyGroceriesSpend = this.$monthlyGroceriesSpend.val();
    var _monthlyRestaurantsSpend = this.$monthlyRestaurantsSpend.val();

    // Calculate per year estimate
    var _flightsSpendPerYear = _numberOfFlights * this.AVERAGE_FLIGHT_COST;
    var _groceriesSpendPerYear = _monthlyGroceriesSpend * this.MONTHS_PER_YEAR;
    var _restaurantsSpendPerYear = _monthlyRestaurantsSpend * this.MONTHS_PER_YEAR;

    // Inject per year estimates as strings
    this.$flightsSpendPerYear.text(String(_flightsSpendPerYear));
    this.$groceriesSpendPerYear.text(String(_groceriesSpendPerYear));
    this.$restaurantsSpendPerYear.text(String(_restaurantsSpendPerYear));

    // Calculate total points per year
    var _flightsPointsPerYear = _flightsSpendPerYear * this.FLIGHTS_POINTS;
    var _groceriesPointsPerYear = _groceriesSpendPerYear * this.GROCERIES_POINTS;
    var _restaurantsPointsPerYear = _restaurantsSpendPerYear * this.RESTAURANTS_POINTS;

    // Inject total points per years as strings
    this.$flightsPointsPerYear.text(String(_flightsPointsPerYear));
    this.$groceriesPointsPerYear.text(String(_groceriesPointsPerYear));
    this.$restaurantsPointsPerYear.text(String(_restaurantsPointsPerYear));

    // Add up all 3 total points per years and inject as string
    var _grandTotalPoints = _flightsPointsPerYear + _groceriesPointsPerYear + _restaurantsPointsPerYear;
    this.$grandTotalPoints.text(String(_grandTotalPoints));



    // Array with all affordable deals based on grand total of TrueBlue points
    this.affordableDealsArray = this.getAffordableDeals(_grandTotalPoints);
    console.log("Number of Affordable Deals:", this.affordableDealsArray.length);

    this.dealsToDisplayArray = this.getDealsToDisplay();
    console.log("Numbers of Deals to Display:", this.dealsToDisplayArray.length);
    console.log("Deals to Display Array:", this.dealsToDisplayArray);


    // Top six deals to display
    var deal0 = this.dealsToDisplayArray[0];
    var deal1 = this.dealsToDisplayArray[1];
    var deal2 = this.dealsToDisplayArray[2];
    var deal3 = this.dealsToDisplayArray[3];
    var deal4 = this.dealsToDisplayArray[4];
    var deal5 = this.dealsToDisplayArray[5];

    console.log("Deal 1:", deal0.Origin.AirportCode, "to", deal0.Destination.AirportCode, "with", deal0.TrueBlueFare.FarePointsAmount, "points");
    console.log("Deal 2:", deal1.Origin.AirportCode, "to", deal1.Destination.AirportCode, "with", deal1.TrueBlueFare.FarePointsAmount, "points");
    console.log("Deal 3:", deal2.Origin.AirportCode, "to", deal2.Destination.AirportCode, "with", deal2.TrueBlueFare.FarePointsAmount, "points");
    console.log("Deal 4:", deal3.Origin.AirportCode, "to", deal3.Destination.AirportCode, "with", deal3.TrueBlueFare.FarePointsAmount, "points");
    console.log("Deal 5:", deal4.Origin.AirportCode, "to", deal4.Destination.AirportCode, "with", deal4.TrueBlueFare.FarePointsAmount, "points");
    console.log("Deal 6:", deal5.Origin.AirportCode, "to", deal5.Destination.AirportCode, "with", deal5.TrueBlueFare.FarePointsAmount, "points");

    // Inject deals
    this.$deal0.text(String(deal0.Origin.AirportCode + " to " + deal0.Destination.AirportCode + " with " + deal0.TrueBlueFare.FarePointsAmount + " points"));
    this.$deal1.text(String(deal1.Origin.AirportCode + " to " + deal1.Destination.AirportCode + " with " + deal1.TrueBlueFare.FarePointsAmount + " points"));
    this.$deal2.text(String(deal2.Origin.AirportCode + " to " + deal2.Destination.AirportCode + " with " + deal2.TrueBlueFare.FarePointsAmount + " points"));
    this.$deal3.text(String(deal3.Origin.AirportCode + " to " + deal3.Destination.AirportCode + " with " + deal3.TrueBlueFare.FarePointsAmount + " points"));
    this.$deal4.text(String(deal4.Origin.AirportCode + " to " + deal4.Destination.AirportCode + " with " + deal4.TrueBlueFare.FarePointsAmount + " points"));
    this.$deal5.text(String(deal5.Origin.AirportCode + " to " + deal5.Destination.AirportCode + " with " + deal5.TrueBlueFare.FarePointsAmount + " points"));



};


// Returns an array of all deals w/ origin that the user specified in the location input
CardculatorApp.prototype.getLocalDealsArray = function() {
    var localDealsArray = []; // empty array to push all local deals into
    var location = this.$location.val(); // get val of location input

    for (var i = 0; i < this.dealsJSON.length; i++) {
        var deal = this.dealsJSON[i]; // get deal for each iteration

        if (deal.Origin.AirportCode == location) {
            localDealsArray.push(deal);
        }
    }

    // Sort the array of local deals from most points to least points
    localDealsArray.sort(function(a, b) {
        return parseFloat(b.TrueBlueFare.FarePointsAmount) - parseFloat(a.TrueBlueFare.FarePointsAmount);
    });
    return localDealsArray;
};


// Based on the grand total of points, pick out the affordable deals from the local deals
CardculatorApp.prototype.getAffordableDeals = function(GrandTotalPoints) {
    var affordableDealsArray = []; // empty array to push all affordable deals into

    for (var i = 0; i < this.localDealsArray.length; i++) {

        var deal = this.localDealsArray[i]; // get deal for each iteration

        if (deal.TrueBlueFare.FarePointsAmount <= GrandTotalPoints) {
            affordableDealsArray.push(deal);
            // console.log(deal.Origin.AirportCode, deal.Destination.AirportCode, deal.TrueBlueFare.FarePointsAmount);
        }
    }
    return affordableDealsArray;
};


// Pick deals from the affordableDealsArray to display
CardculatorApp.prototype.getDealsToDisplay = function() {
    var dealsToDisplayArray = [this.affordableDealsArray[0]]; // array to push deals to display into with the first deal already in it

    // console.log("First deal", this.affordableDealsArray[0]);

    for (var i = 1; i < this.affordableDealsArray.length; i++) {

        var deal = this.affordableDealsArray[i]; // get deal for each iteration
        var dealLatLng = this.getLatLngFromAirportCode(deal.Destination.AirportCode);   // lat lng of the deal

        if (this.isAirportFarEnoughAwayFromDealsList(dealsToDisplayArray, dealLatLng, deal.Destination.AirportCode)) {
            dealsToDisplayArray.push(deal);
        }
    }
    return dealsToDisplayArray;
};


// Returns false if deal is too close to ANY of the deals in the dealsToDisplayArray, returns true if deal is far enough away
CardculatorApp.prototype.isAirportFarEnoughAwayFromDealsList = function(DealListArray, LatLon, LatLonAirportCode) {
    // console.log("_________________________________________");

    for (var i = 0; i < DealListArray.length; i++) {

        var deal = DealListArray[i]; // get deal for each iteration
        var dealLatLng = this.getLatLngFromAirportCode(deal.Destination.AirportCode);   // lat lng of deal
        var distanceinKM = LatLon.distanceTo(dealLatLng);

        // console.log(LatLonAirportCode, " to ", deal.Destination.AirportCode, " is: ", distanceinKM);

        if (LatLon.distanceTo(dealLatLng) < this.KM_RADIUS_THRESHOLD) {
            // console.log("BUSTED");
            return false;
        }
    }
    // console.log("YAY! THIS LOCATION IS ISOLATED:", LatLonAirportCode);
    return true;

};

// Gets lat lng of airport
CardculatorApp.prototype.getLatLngFromAirportCode = function(AirportCode) {
    for (var i = 0; i < AIRPORT_ARRAY.length; i++) {
        if (AIRPORT_ARRAY[i].airportCode == AirportCode) {
            return AIRPORT_ARRAY[i].latLng;
        }
    }
    return null;
};


CardculatorApp.prototype.getAirportClosestToLatLng = function(LatLngObj) {
    var _closestAirportObj = null;
    var _closestAirportDist = Number.POSITIVE_INFINITY;

    for (var i = 0; i < AIRPORT_ARRAY.length; i++) {
        var _d = LatLngObj.distanceTo(AIRPORT_ARRAY[i].latLng);

        if (_d < _closestAirportDist) {
            _closestAirportDist = _d;
            _closestAirportObj = AIRPORT_ARRAY[i];
        }
    }
    return _closestAirportObj;
};


$(function() {
    new CardculatorApp();
});
