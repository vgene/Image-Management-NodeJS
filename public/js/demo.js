/*
 * Bootstrap Image Gallery JS Demo
 * https://github.com/blueimp/Bootstrap-Image-Gallery
 *
 * Copyright 2013, Sebastian Tschan
 * https://blueimp.net
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */
var nowType=null;
//todo 整合常量
var ROOT_URL='http://222.29.98.109';
var dbarray;
function uploadWithType(){
    window.location = '/upload?id='+nowType;
}

$(function () {
    //var folder = "img/train/"
    var car_type_url = "api/getCarTypes"
    $.ajax({

        url: car_type_url,
        data: {
            format: 'json'
        },

        success: function (result) {
            var linksContainer = $('#typeLinks')
            var baseUrl;

            $.each(result.cars, function (index, car) {
                $('<div/>')
                    .append(
                        $('<a/>')
                            .attr('style','color:grey')
                            .append(car.brand + ' ' + car.type+' ('+car.count+')')
                            .attr('href', "javascript:void(0);")
                            .attr('onclick', '$("#carType").text("'+car.brand + ' ' + car.type+' ('+car.count+')'+'");loadCarType(\'' + car.id + '\');'+'nowType=\''+car.id+"';$(\"#btnAddImage\").removeClass('hidden');")
                    )
                    .attr('class', 'col-sm-3')
                    .appendTo(linksContainer)
            })
        }
    }).done(
)
});

/*global blueimp, $ */

function showCarTypes(){
    $("#typeLinks").removeClass("hidden");
    $("#links").empty();
    $("#carType").text('汽车型号');
    $("#btnAddImage").addClass('hidden');
}

function loadCarType (cartype) {
  'use strict'
  // Load demo images from flickr:
  $.ajax({
    url: 'api/getCarImages?id='+cartype,
    data:{ format: 'json'},
    success:function (result) {
    var linksContainer = $('#links')
    var baseUrl;
	dbarray=new Array();
  //  // Add the demo images as links with thumbnails to the page:
    $.each(result.data, function (index, car) {
      baseUrl = ROOT_URL+'/img/';
      // console.log(result.data);
	  dbarray.push(car.sImage);
      var hImage = car.mImage;
      if (car.lImage && car.lImage!=""){
          hImage = car.lImage;
      }

      $('<a/>')
        .append($('<img>').prop('class','col-lg-2 lazy').attr('data-original', baseUrl +car.sImage+ '.jpg'))
        .prop('href', baseUrl +hImage+ '.jpg')
        .prop('title', car.brand+car.type)
        .attr('data-gallery', '')
        .appendTo(linksContainer)
    })
  }}).done(function() {

        $("img.lazy").lazyload();
    });

    $("#typeLinks").addClass("hidden");
    $("#carType").val(cartype);
/*
    var folder = "img/train/"+cartype+'/'
    $.ajax({

        url : folder,
        success: function (data) {
            var linksContainer = $('#links')
            var baseUrl;
            $(data).find("a").attr("href", function (i, val) {

                if( val.match(/\.(jpe?g|png|gif)$/) ) {

                    baseUrl = folder+val;
                    $('<a/>')
                        .append($('<img>').prop('class','col-lg-2 lazy').attr('data-original', baseUrl))
                        .prop('href', baseUrl)
                        .prop('title', val)
                        .attr('data-gallery', '')
                        .appendTo(linksContainer)

                }
            });
        }
    }).done(function() {
        $("img.lazy").lazyload();
    });
*/
  $('#borderless-checkbox').on('change', function () {
    var borderless = $(this).is(':checked')
    $('#blueimp-gallery').data('useBootstrapModal', !borderless)
    $('#blueimp-gallery').toggleClass('blueimp-gallery-controls', borderless)
  })

  $('#fullscreen-checkbox').on('change', function () {
    $('#blueimp-gallery').data('fullScreen', $(this).is(':checked'))
  })
  

}
