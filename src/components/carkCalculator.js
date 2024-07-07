import React from 'react';
import moment from 'moment';

{/* -90
-45
0
130
180
220
*/}

function carkCalculator(data = {
    dogumTarihi: new Date(),
    dogumSaati: undefined,
    erkek: false,
    kadin: false,
    boy: 0,
    anneYas: 0,
    babaYas: 0
}) {

    let sonucData = {
        duygusallik: 0,
        sinirlilik: 0,
        irade: 0,
        ego: 0,
        sadakat: 0,
        merhamet: 0,
        sorumluluk: 0,
        count: 0,
        crk1:0,
        crk2:0,
        ort:0
    }

    /////*Gün
    let gun = 0
    if (moment(data.dogumTarihi).format("D") > 5) {
        gun = 1;
        sonucData.duygusallik = sonucData.duygusallik + 10;

        sonucData.sinirlilik = sonucData.sinirlilik + 5;
        sonucData.irade = sonucData.irade + 3;
        sonucData.ego = sonucData.ego + 8;
        sonucData.sadakat = sonucData.sadakat + 1;
        sonucData.merhamet = sonucData.merhamet + 10;
        sonucData.sorumluluk = sonucData.sorumluluk + 10;
        sonucData.count = sonucData.count + 1;
        if (data.erkek) {

            sonucData.duygusallik = sonucData.duygusallik + 9;
            sonucData.sinirlilik = sonucData.sinirlilik + 2;
            sonucData.irade = sonucData.irade + 3;
            sonucData.ego = sonucData.ego + 3;
            sonucData.sadakat = sonucData.sadakat + 5;
            sonucData.merhamet = sonucData.merhamet + 8;
            sonucData.sorumluluk = sonucData.sorumluluk + 10;
            sonucData.count = sonucData.count + 1;
        } 
        if (data.kiz) {

            sonucData.duygusallik = sonucData.duygusallik + 0;
            sonucData.sinirlilik = sonucData.sinirlilik + 9;
            sonucData.irade = sonucData.irade + 8;
            sonucData.ego = sonucData.ego + 7;
            sonucData.sadakat = sonucData.sadakat + 0;
            sonucData.merhamet = sonucData.merhamet + 8;
            sonucData.sorumluluk = sonucData.sorumluluk + 0;
            sonucData.count = sonucData.count + 1;
        } 
        
    }

    if (moment(data.dogumTarihi).format("D") > 15) {
        gun = 4
        sonucData.duygusallik = sonucData.duygusallik + 3;
        sonucData.sinirlilik = sonucData.sinirlilik + 10;
        sonucData.irade = sonucData.irade + 8;
        sonucData.ego = sonucData.ego + 1;
        sonucData.sadakat = sonucData.sadakat + 1;
        sonucData.merhamet = sonucData.merhamet + 10;
        sonucData.sorumluluk = sonucData.sorumluluk + 1;
        sonucData.count = sonucData.count + 1;
        if (data.erkek) {

            sonucData.duygusallik = sonucData.duygusallik + 7;
            sonucData.sinirlilik = sonucData.sinirlilik + 3;
            sonucData.irade = sonucData.irade + 8;
            sonucData.ego = sonucData.ego + 6;
            sonucData.sadakat = sonucData.sadakat + 1;
            sonucData.merhamet = sonucData.merhamet + 1;
            sonucData.sorumluluk = sonucData.sorumluluk + 8;
            sonucData.count = sonucData.count + 1;
        } 
        if (data.kiz) {

            sonucData.duygusallik = sonucData.duygusallik + 2;
            sonucData.sinirlilik = sonucData.sinirlilik + 9;
            sonucData.irade = sonucData.irade + 3;
            sonucData.ego = sonucData.ego + 9;
            sonucData.sadakat = sonucData.sadakat + 2;
            sonucData.merhamet = sonucData.merhamet + 8;
            sonucData.sorumluluk = sonucData.sorumluluk + 2;
            sonucData.count = sonucData.count + 1;
        } 

    }
    if (moment(data.dogumTarihi).format("D") > 20) {
        gun = 6
        sonucData.duygusallik = sonucData.duygusallik + 8;
        sonucData.sinirlilik = sonucData.sinirlilik + 8;
        sonucData.irade = sonucData.irade + 1;
        sonucData.ego = sonucData.ego + 10;
        sonucData.sadakat = sonucData.sadakat + 0;
        sonucData.merhamet = sonucData.merhamet + 10;
        sonucData.sorumluluk = sonucData.sorumluluk + 1;
        sonucData.count = sonucData.count + 1;
        if (data.erkek) {

            sonucData.duygusallik = sonucData.duygusallik + 9;
            sonucData.sinirlilik = sonucData.sinirlilik + 2;
            sonucData.irade = sonucData.irade + 3;
            sonucData.ego = sonucData.ego + 3;
            sonucData.sadakat = sonucData.sadakat + 5;
            sonucData.merhamet = sonucData.merhamet + 8;
            sonucData.sorumluluk = sonucData.sorumluluk + 10;
            sonucData.count = sonucData.count + 1;
        } 
        if (data.kiz) {

            sonucData.duygusallik = sonucData.duygusallik + 0;
            sonucData.sinirlilik = sonucData.sinirlilik + 9;
            sonucData.irade = sonucData.irade + 8;
            sonucData.ego = sonucData.ego + 7;
            sonucData.sadakat = sonucData.sadakat + 0;
            sonucData.merhamet = sonucData.merhamet + 8;
            sonucData.sorumluluk = sonucData.sorumluluk + 0;
            sonucData.count = sonucData.count + 1;
        } 
    }
    if (moment(data.dogumTarihi).format("D") > 25) {
        gun = 8
        sonucData.duygusallik = sonucData.duygusallik + 5;
        sonucData.sinirlilik = sonucData.sinirlilik + 0;
        sonucData.irade = sonucData.irade + 5;
        sonucData.ego = sonucData.ego + 4;
        sonucData.sadakat = sonucData.sadakat + 2;
        sonucData.merhamet = sonucData.merhamet + 7;
        sonucData.sorumluluk = sonucData.sorumluluk + 1;
        sonucData.count = sonucData.count + 1;
    }
    if (moment(data.dogumTarihi).format("D") > 27) {
        gun = 10
        sonucData.duygusallik = sonucData.duygusallik + 0;
        sonucData.sinirlilik = sonucData.sinirlilik + 2;
        sonucData.irade = sonucData.irade + 3;
        sonucData.ego = sonucData.ego + 8;
        sonucData.sadakat = sonucData.sadakat + 3;
        sonucData.merhamet = sonucData.merhamet + 3;
        sonucData.sorumluluk = sonucData.sorumluluk + 8;
        sonucData.count = sonucData.count + 1;
    }
    ///Gün Hesap

    ///*Ay
    let ay = 0
    if (moment(data.dogumTarihi).format("M") > 1) {
        ay = 1
        sonucData.duygusallik = sonucData.duygusallik + 9;
        sonucData.sinirlilik = sonucData.sinirlilik + 3;
        sonucData.irade = sonucData.irade + 8;
        sonucData.ego = sonucData.ego + 0;
        sonucData.sadakat = sonucData.sadakat + 8;
        sonucData.merhamet = sonucData.merhamet + 6;
        sonucData.sorumluluk = sonucData.sorumluluk + 8;
        sonucData.count = sonucData.count + 1;
    }
    if (moment(data.dogumTarihi).format("M") > 3) {
        ay = 2
        sonucData.duygusallik = sonucData.duygusallik + 2;
        sonucData.sinirlilik = sonucData.sinirlilik + 2;
        sonucData.irade = sonucData.irade + 8;
        sonucData.ego = sonucData.ego + 2;
        sonucData.sadakat = sonucData.sadakat + 1;
        sonucData.merhamet = sonucData.merhamet + 3;
        sonucData.sorumluluk = sonucData.sorumluluk + 1;
        sonucData.count = sonucData.count + 1;
    }
    if (moment(data.dogumTarihi).format("M") > 4) {
        ay = 3
        sonucData.duygusallik = sonucData.duygusallik + 4;
        sonucData.sinirlilik = sonucData.sinirlilik + 8;
        sonucData.irade = sonucData.irade + 7;
        sonucData.ego = sonucData.ego + 5;
        sonucData.sadakat = sonucData.sadakat + 6;
        sonucData.merhamet = sonucData.merhamet + 1;
        sonucData.sorumluluk = sonucData.sorumluluk + 7;
        sonucData.count = sonucData.count + 1;
    }
    if (moment(data.dogumTarihi).format("M") > 6) {
        ay = 5
        sonucData.duygusallik = sonucData.duygusallik + 6;
        sonucData.sinirlilik = sonucData.sinirlilik + 1;
        sonucData.irade = sonucData.irade + 3;
        sonucData.ego = sonucData.ego + 10;
        sonucData.sadakat = sonucData.sadakat + 1;
        sonucData.merhamet = sonucData.merhamet + 7;
        sonucData.sorumluluk = sonucData.sorumluluk + 2;
        sonucData.count = sonucData.count + 1;
    }
    if (moment(data.dogumTarihi).format("M") > 8) {
        ay = 6
        sonucData.duygusallik = sonucData.duygusallik + 10;
        sonucData.sinirlilik = sonucData.sinirlilik + 1;
        sonucData.irade = sonucData.irade + 10;
        sonucData.ego = sonucData.ego + 10;
        sonucData.sadakat = sonucData.sadakat + 10;
        sonucData.merhamet = sonucData.merhamet + 7;
        sonucData.sorumluluk = sonucData.sorumluluk + 10;
        sonucData.count = sonucData.count + 1;
    }

    if (moment(data.dogumTarihi).format("M") > 10) {
        ay = 10
        sonucData.duygusallik = sonucData.duygusallik + 8;
        sonucData.sinirlilik = sonucData.sinirlilik + 1;
        sonucData.irade = sonucData.irade + 3;
        sonucData.ego = sonucData.ego + 9;
        sonucData.sadakat = sonucData.sadakat + 10;
        sonucData.merhamet = sonucData.merhamet + 7;
        sonucData.sorumluluk = sonucData.sorumluluk + 2;
        sonucData.count = sonucData.count + 1;
    }
    /// Ay Bitş

    //Yıl
    let yil = 0


    if (moment(data.dogumTarihi).format("yyyy") > 1950) {
        yil = 0
        sonucData.duygusallik = sonucData.duygusallik + 10;
        sonucData.sinirlilik = sonucData.sinirlilik + 10;
        sonucData.irade = sonucData.irade + 1;
        sonucData.ego = sonucData.ego + 1;
        sonucData.sadakat = sonucData.sadakat + 10;
        sonucData.merhamet = sonucData.merhamet + 10;
        sonucData.sorumluluk = sonucData.sorumluluk + 10;
        sonucData.count = sonucData.count + 1;
    }

    if (moment(data.dogumTarihi).format("yyyy") > 1952) {
        yil = 6
        sonucData.duygusallik = (sonucData.duygusallik + 9);
        sonucData.sinirlilik = (sonucData.sinirlilik + 10)
        sonucData.irade = (sonucData.irade + 8)
        sonucData.ego = (sonucData.ego + 3)
        sonucData.sadakat = (sonucData.sadakat + 5)
        sonucData.merhamet = (sonucData.merhamet + 8)
        sonucData.sorumluluk = (sonucData.sorumluluk + 10)
        sonucData.count = sonucData.count +1
    }
    if (moment(data.dogumTarihi).format("yyyy") > 1954) {
        yil = 7
        sonucData.duygusallik = (sonucData.duygusallik + 5)
        sonucData.sinirlilik = (sonucData.sinirlilik + 8)
        sonucData.irade = (sonucData.irade + 7)
        sonucData.ego = (sonucData.ego + 5)
        sonucData.sadakat = (sonucData.sadakat + 9)
        sonucData.merhamet = (sonucData.merhamet + 10)
        sonucData.sorumluluk = (sonucData.sorumluluk + 10)
        sonucData.count = sonucData.count+1
    }

    if (moment(data.dogumTarihi).format("yyyy") >= 1956) {
        yil = 7
        sonucData.duygusallik = sonucData.duygusallik + 10;
        sonucData.sinirlilik = sonucData.sinirlilik + 3;
        sonucData.irade = sonucData.irade + 10;
        sonucData.ego = sonucData.ego + 10;
        sonucData.sadakat = sonucData.sadakat + 10;
        sonucData.merhamet = sonucData.merhamet + 1;
        sonucData.sorumluluk = sonucData.sorumluluk + 10;
        sonucData.count = sonucData.count + 1;
    }

    if (moment(data.dogumTarihi).format("yyyy") > 1958) {
        yil = 6
        sonucData.duygusallik = (sonucData.duygusallik + 9)
        sonucData.sinirlilik = (sonucData.sinirlilik + 10)
        sonucData.irade = (sonucData.irade + 8)
        sonucData.ego = (sonucData.ego + 3)
        sonucData.sadakat = (sonucData.sadakat + 5)
        sonucData.merhamet = (sonucData.merhamet + 8)
        sonucData.sorumluluk = (sonucData.sorumluluk + 10)
        sonucData.count = sonucData.count +1
    }



    if (moment(data.dogumTarihi).format("yyyy") > 1960) {
        yil = 0
        sonucData.duygusallik = sonucData.duygusallik + 10;
        sonucData.sinirlilik = sonucData.sinirlilik + 10;
        sonucData.irade = sonucData.irade + 1;
        sonucData.ego = sonucData.ego + 1;
        sonucData.sadakat = sonucData.sadakat + 10;
        sonucData.merhamet = sonucData.merhamet + 10;
        sonucData.sorumluluk = sonucData.sorumluluk + 10;
        sonucData.count = sonucData.count + 1;
    }

    if (moment(data.dogumTarihi).format("yyyy") > 1962) {
        yil = 6
        sonucData.duygusallik = (sonucData.duygusallik + 9)
        sonucData.sinirlilik = (sonucData.sinirlilik + 10)
        sonucData.irade = (sonucData.irade + 8)
        sonucData.ego = (sonucData.ego + 3)
        sonucData.sadakat = (sonucData.sadakat + 5)
        sonucData.merhamet = (sonucData.merhamet + 8)
        sonucData.sorumluluk = (sonucData.sorumluluk + 10)
        sonucData.count = sonucData.count +1
    }
    if (moment(data.dogumTarihi).format("yyyy") > 1964) {
        yil = 7
        sonucData.duygusallik = (sonucData.duygusallik + 5)
        sonucData.sinirlilik = (sonucData.sinirlilik + 8)
        sonucData.irade = (sonucData.irade + 7)
        sonucData.ego = (sonucData.ego + 5)
        sonucData.sadakat = (sonucData.sadakat + 9)
        sonucData.merhamet = (sonucData.merhamet + 10)
        sonucData.sorumluluk = (sonucData.sorumluluk + 10)
        sonucData.count = sonucData.count +1
    }

    if (moment(data.dogumTarihi).format("yyyy") >= 1966) {
        yil = 7
        sonucData.duygusallik = sonucData.duygusallik + 10;
        sonucData.sinirlilik = sonucData.sinirlilik + 3;
        sonucData.irade = sonucData.irade + 10;
        sonucData.ego = sonucData.ego + 10;
        sonucData.sadakat = sonucData.sadakat + 10;
        sonucData.merhamet = sonucData.merhamet + 1;
        sonucData.sorumluluk = sonucData.sorumluluk + 10;
        sonucData.count = sonucData.count + 1;
    }

    if (moment(data.dogumTarihi).format("yyyy") > 1968) {
        yil = 6
        sonucData.duygusallik = (sonucData.duygusallik + 9)
        sonucData.sinirlilik = (sonucData.sinirlilik + 10)
        sonucData.irade = (sonucData.irade + 8)
        sonucData.ego = (sonucData.ego + 3)
        sonucData.sadakat = (sonucData.sadakat + 5)
        sonucData.merhamet = (sonucData.merhamet + 8)
        sonucData.sorumluluk = (sonucData.sorumluluk + 10)
        sonucData.count = sonucData.count +1
    }

    if (moment(data.dogumTarihi).format("yyyy") > 1970) {
        yil = 1
        sonucData.duygusallik = sonucData.duygusallik + 10;
        sonucData.sinirlilik = sonucData.sinirlilik + 10;
        sonucData.irade = sonucData.irade + 10;
        sonucData.ego = sonucData.ego + 1;
        sonucData.sadakat = sonucData.sadakat + 10;
        sonucData.merhamet = sonucData.merhamet + 7;
        sonucData.sorumluluk = sonucData.sorumluluk + 10;
        sonucData.count = sonucData.count + 1;
    }
    if (moment(data.dogumTarihi).format("yyyy") > 1972) {
        yil = 6
        sonucData.duygusallik = (sonucData.duygusallik + 9)
        sonucData.sinirlilik = (sonucData.sinirlilik + 10)
        sonucData.irade = (sonucData.irade + 8)
        sonucData.ego = (sonucData.ego + 3)
        sonucData.sadakat = (sonucData.sadakat + 5)
        sonucData.merhamet = (sonucData.merhamet + 8)
        sonucData.sorumluluk = (sonucData.sorumluluk + 10)
        sonucData.count = sonucData.count +1
    }
    if (moment(data.dogumTarihi).format("yyyy") > 1974) {
        yil = 7
        sonucData.duygusallik = (sonucData.duygusallik + 5)
        sonucData.sinirlilik = (sonucData.sinirlilik + 8)
        sonucData.irade = (sonucData.irade + 7)
        sonucData.ego = (sonucData.ego + 5)
        sonucData.sadakat = (sonucData.sadakat + 9)
        sonucData.merhamet = (sonucData.merhamet + 10)
        sonucData.sorumluluk = (sonucData.sorumluluk + 10)
        sonucData.count = sonucData.count +1
    }

    if (moment(data.dogumTarihi).format("yyyy") >= 1976) {
        yil = 7
        sonucData.duygusallik = sonucData.duygusallik + 10;
        sonucData.sinirlilik = sonucData.sinirlilik + 3;
        sonucData.irade = sonucData.irade + 10;
        sonucData.ego = sonucData.ego + 10;
        sonucData.sadakat = sonucData.sadakat + 10;
        sonucData.merhamet = sonucData.merhamet + 1;
        sonucData.sorumluluk = sonucData.sorumluluk + 10;
        sonucData.count = sonucData.count + 1;
    }

    if (moment(data.dogumTarihi).format("yyyy") > 1978) {
        yil = 6
        sonucData.duygusallik = (sonucData.duygusallik + 9)
        sonucData.sinirlilik = (sonucData.sinirlilik + 10)
        sonucData.irade = (sonucData.irade + 8)
        sonucData.ego = (sonucData.ego + 3)
        sonucData.sadakat = (sonucData.sadakat + 5)
        sonucData.merhamet = (sonucData.merhamet + 8)
        sonucData.sorumluluk = (sonucData.sorumluluk + 10)
        sonucData.count = sonucData.count +1
    }

    if (moment(data.dogumTarihi).format("yyyy") > 1980) {
        yil = 2
        sonucData.duygusallik = sonucData.duygusallik + 8;
        sonucData.sinirlilik = sonucData.sinirlilik + 7;
        sonucData.irade = sonucData.irade + 10;
        sonucData.ego = sonucData.ego + 3;
        sonucData.sadakat = sonucData.sadakat + 10;
        sonucData.merhamet = sonucData.merhamet + 7;
        sonucData.sorumluluk = sonucData.sorumluluk + 10;
        sonucData.count = sonucData.count + 1;
    }
    if (moment(data.dogumTarihi).format("yyyy") > 1990) {
        yil = 4
        sonucData.duygusallik = (sonucData.duygusallik + 7)
        sonucData.sinirlilik = (sonucData.sinirlilik + 6)
        sonucData.irade = (sonucData.irade + 8)
        sonucData.ego = (sonucData.ego + 6)
        sonucData.sadakat = (sonucData.sadakat + 7)
        sonucData.merhamet = (sonucData.merhamet + 7)
        sonucData.sorumluluk = (sonucData.sorumluluk + 7)
        sonucData.count = sonucData.count +1
    }
    if (moment(data.dogumTarihi).format("yyyy") > 1992) {
        yil = 6
        sonucData.duygusallik = (sonucData.duygusallik + 9)
        sonucData.sinirlilik = (sonucData.sinirlilik + 10)
        sonucData.irade = (sonucData.irade + 8)
        sonucData.ego = (sonucData.ego + 3)
        sonucData.sadakat = (sonucData.sadakat + 5)
        sonucData.merhamet = (sonucData.merhamet + 8)
        sonucData.sorumluluk = (sonucData.sorumluluk + 10)
        sonucData.count = sonucData.count +1
    }
    if (moment(data.dogumTarihi).format("yyyy") > 1994) {
        yil = 7
        sonucData.duygusallik = (sonucData.duygusallik + 5)
        sonucData.sinirlilik = (sonucData.sinirlilik + 8)
        sonucData.irade = (sonucData.irade + 7)
        sonucData.ego = (sonucData.ego + 5)
        sonucData.sadakat = (sonucData.sadakat + 9)
        sonucData.merhamet = (sonucData.merhamet + 10)
        sonucData.sorumluluk = (sonucData.sorumluluk + 10)
        sonucData.count = sonucData.count +1
    }
    if (moment(data.dogumTarihi).format("yyyy") > 1996) {
        yil = 7
        sonucData.duygusallik = (sonucData.duygusallik + 5)
        sonucData.sinirlilik = (sonucData.sinirlilik + 2)
        sonucData.irade = (sonucData.irade + 6)
        sonucData.ego = (sonucData.ego + 7)
        sonucData.sadakat = (sonucData.sadakat + 2)
        sonucData.merhamet = (sonucData.merhamet + 1);
        sonucData.sorumluluk = (sonucData.sorumluluk + 3)
        sonucData.count = sonucData.count +1
    }

    if (moment(data.dogumTarihi).format("yyyy") >= 1997) {
        yil = 7
        sonucData.duygusallik = sonucData.duygusallik + 10;
        sonucData.sinirlilik = sonucData.sinirlilik + 3;
        sonucData.irade = sonucData.irade + 10;
        sonucData.ego = sonucData.ego + 10;
        sonucData.sadakat = sonucData.sadakat + 10;
        sonucData.merhamet = sonucData.merhamet + 1;
        sonucData.sorumluluk = sonucData.sorumluluk + 10;
        sonucData.count = sonucData.count + 1;
    }


    if (moment(data.dogumTarihi).format("yyyy") > 1998) {
        yil = 8
        sonucData.duygusallik = sonucData.duygusallik + 6;
        sonucData.irade = sonucData.irade + 1;
        sonucData.sinirlilik = sonucData.sinirlilik + 8;
        sonucData.ego = sonucData.ego + 9;
        sonucData.sadakat = sonucData.sadakat + 2;
        sonucData.merhamet = sonucData.merhamet + 6;
        sonucData.sorumluluk = sonucData.sorumluluk + 1;
        sonucData.count = sonucData.count + 1;
    }
    if (moment(data.dogumTarihi).format("yyyy") > 2002) {
        yil = 3
        sonucData.duygusallik = sonucData.duygusallik + 0;
        sonucData.sinirlilik = sonucData.sinirlilik + 4;
        sonucData.irade = sonucData.irade + 0;
        sonucData.ego = sonucData.ego + 10;
        sonucData.sadakat = sonucData.sadakat + 0;
        sonucData.merhamet = sonucData.merhamet + 0;
        sonucData.sorumluluk = sonucData.sorumluluk + 0;
        sonucData.count = sonucData.count + 1;
    }
    if (moment(data.dogumTarihi).format("yyyy") > 2005) {
        yil = 9
        sonucData.duygusallik = sonucData.duygusallik + 0;
        sonucData.sinirlilik = sonucData.sinirlilik + 2;
        sonucData.irade = sonucData.irade + 10;
        sonucData.ego = sonucData.ego + 10;
        sonucData.sadakat = sonucData.sadakat + 0;
        sonucData.merhamet = sonucData.merhamet + 1;
        sonucData.sorumluluk = sonucData.sorumluluk + 10;
        sonucData.count = sonucData.count + 1;
    }

    if (moment(data.dogumTarihi).format("yyyy") > 2010) {
        yil = 10
        sonucData.duygusallik = sonucData.duygusallik + 0;
        sonucData.sinirlilik = sonucData.sinirlilik + 1;
        sonucData.irade = sonucData.irade + 3;
        sonucData.ego = sonucData.ego + 9;
        sonucData.sadakat = sonucData.sadakat + 10;
        sonucData.merhamet = sonucData.merhamet + 7;
        sonucData.sorumluluk = sonucData.sorumluluk + 2;
        sonucData.count = sonucData.count + 1;
    }
    if (moment(data.dogumTarihi).format("yyyy") > 2015) {
        yil = 7
        sonucData.duygusallik = sonucData.duygusallik + 0;
        sonucData.sinirlilik = sonucData.sinirlilik + 1;
        sonucData.irade = sonucData.irade + 3;
        sonucData.ego = sonucData.ego + 9;
        sonucData.sadakat = sonucData.sadakat + 10;
        sonucData.merhamet = sonucData.merhamet + 7;
        sonucData.sorumluluk = sonucData.sorumluluk + 2;
        sonucData.count = sonucData.count + 1;
    }

    if (moment(data.dogumTarihi).format("yyyy") > 2018) {
        yil = 7
        sonucData.duygusallik = sonucData.duygusallik + 0;
        sonucData.sinirlilik = sonucData.sinirlilik + 1;
        sonucData.irade = sonucData.irade + 3;
        sonucData.ego = sonucData.ego + 9;
        sonucData.sadakat = sonucData.sadakat + 10;
        sonucData.merhamet = sonucData.merhamet + 7;
        sonucData.sorumluluk = sonucData.sorumluluk + 2;
        sonucData.count = sonucData.count + 1;
    }
    if (moment(data.dogumTarihi).format("yyyy") > 2020) {
        yil = 10
        sonucData.duygusallik = sonucData.duygusallik + 0;
        sonucData.sinirlilik = sonucData.sinirlilik + 1;
        sonucData.irade = sonucData.irade + 3;
        sonucData.ego = sonucData.ego + 9;
        sonucData.sadakat = sonucData.sadakat + 10;
        sonucData.merhamet = sonucData.merhamet + 7;
        sonucData.sorumluluk = sonucData.sorumluluk + 2;
        sonucData.count = sonucData.count + 1;
    }
    if (moment(data.dogumTarihi).format("yyyy") > 2022) {
        yil = 7
        sonucData.duygusallik = (sonucData.duygusallik + 5)
        sonucData.sinirlilik = (sonucData.sinirlilik + 2)
        sonucData.irade = (sonucData.irade + 6)
        sonucData.ego = (sonucData.ego + 7)
        sonucData.sadakat = (sonucData.sadakat + 2)
        sonucData.merhamet = (sonucData.merhamet + 1)
        sonucData.sorumluluk = (sonucData.sorumluluk + 3)
        sonucData.count = sonucData.count+1
    }
    if (moment(data.dogumTarihi).format("yyyy") > 2025) {
        yil = 8
        sonucData.duygusallik = sonucData.duygusallik + 6;
        sonucData.irade = sonucData.irade + 1;
        sonucData.sinirlilik = sonucData.sinirlilik + 8;
        sonucData.ego = sonucData.ego + 9;
        sonucData.sadakat = sonucData.sadakat + 2;
        sonucData.merhamet = sonucData.merhamet + 6;
        sonucData.sorumluluk = sonucData.sorumluluk + 1;
        sonucData.count = sonucData.count + 1;
    }

    let ddSaat = 0
    try {
        ddSaat = data.dogumSaati.split(":")[0]
        if (ddSaat > 1) {

            sonucData.duygusallik = sonucData.duygusallik + 0;
            sonucData.sinirlilik = sonucData.sinirlilik + 1;
            sonucData.irade = sonucData.irade + 3;
            sonucData.ego = sonucData.ego + 9;
            sonucData.sadakat = sonucData.sadakat + 10;
            sonucData.merhamet = sonucData.merhamet + 7;
            sonucData.sorumluluk = sonucData.sorumluluk + 2;
            sonucData.count = sonucData.count + 1;
        }
        if (ddSaat > 3) {

            sonucData.duygusallik = sonucData.duygusallik + 0;
            sonucData.sinirlilik = sonucData.sinirlilik + 2;
            sonucData.irade = sonucData.irade + 2;
            sonucData.ego = sonucData.ego + 1;
            sonucData.sadakat = sonucData.sadakat + 0;
            sonucData.merhamet = sonucData.merhamet + 4;
            sonucData.sorumluluk = sonucData.sorumluluk + 1;
            sonucData.count = sonucData.count + 1;
        }
        if (ddSaat > 5) {

            sonucData.duygusallik = sonucData.duygusallik + 3;
            sonucData.sinirlilik = sonucData.sinirlilik + 6;
            sonucData.irade = sonucData.irade + 7;
            sonucData.ego = sonucData.ego + 8;
            sonucData.sadakat = sonucData.sadakat + 3;
            sonucData.merhamet = sonucData.merhamet + 8;
            sonucData.sorumluluk = sonucData.sorumluluk + 5;
            sonucData.count = sonucData.count + 1;
        }
        if (ddSaat > 8) {

            sonucData.duygusallik = sonucData.duygusallik + 8;
            sonucData.sinirlilik = sonucData.sinirlilik + 7;
            sonucData.irade = sonucData.irade + 10;
            sonucData.ego = sonucData.ego + 3;
            sonucData.sadakat = sonucData.sadakat + 10;
            sonucData.merhamet = sonucData.merhamet + 7;
            sonucData.sorumluluk = sonucData.sorumluluk + 10;
            sonucData.count = sonucData.count + 1;
        }

        if (ddSaat > 11) {

            sonucData.duygusallik = sonucData.duygusallik + 3;
            sonucData.sinirlilik = sonucData.sinirlilik + 10;
            sonucData.irade = sonucData.irade + 8;
            sonucData.ego = sonucData.ego + 1;
            sonucData.sadakat = sonucData.sadakat + 1;
            sonucData.merhamet = sonucData.merhamet + 10;
            sonucData.sorumluluk = sonucData.sorumluluk + 1;
            sonucData.count = sonucData.count + 1;
        }
        if (ddSaat > 14) {

            sonucData.duygusallik = sonucData.duygusallik + 8;
            sonucData.sinirlilik = sonucData.sinirlilik + 8;
            sonucData.irade = sonucData.irade + 1;
            sonucData.ego = sonucData.ego + 10;
            sonucData.sadakat = sonucData.sadakat + 0;
            sonucData.merhamet = sonucData.merhamet + 10;
            sonucData.sorumluluk = sonucData.sorumluluk + 1;
            sonucData.count = sonucData.count + 1;
        }
        if (ddSaat > 14) {

            sonucData.duygusallik = sonucData.duygusallik + 3;
            sonucData.sinirlilik = sonucData.sinirlilik + 2;
            sonucData.irade = sonucData.irade + 7;
            sonucData.ego = sonucData.ego + 2;
            sonucData.sadakat = sonucData.sadakat + 10;
            sonucData.merhamet = sonucData.merhamet + 10;
            sonucData.sorumluluk = sonucData.sorumluluk + 7;
            sonucData.count = sonucData.count + 1;
        }
        if (ddSaat > 16) {

            sonucData.duygusallik = sonucData.duygusallik + 8;
            sonucData.sinirlilik = sonucData.sinirlilik + 8;
            sonucData.irade = sonucData.irade + 1;
            sonucData.ego = sonucData.ego + 10;
            sonucData.sadakat = sonucData.sadakat + 0;
            sonucData.merhamet = sonucData.merhamet + 10;
            sonucData.sorumluluk = sonucData.sorumluluk + 1;
            sonucData.count = sonucData.count + 1;
        }
        if (ddSaat > 19) {

            sonucData.duygusallik = sonucData.duygusallik + 4;
            sonucData.sinirlilik = sonucData.sinirlilik + 8;
            sonucData.irade = sonucData.irade + 7;
            sonucData.ego = sonucData.ego + 5;
            sonucData.sadakat = sonucData.sadakat + 6;
            sonucData.merhamet = sonucData.merhamet + 1;
            sonucData.sorumluluk = sonucData.sorumluluk + 7;
            sonucData.count = sonucData.count + 1;
        }
        if (ddSaat > 22) {

            sonucData.duygusallik = sonucData.duygusallik + 3;
            sonucData.sinirlilik = sonucData.sinirlilik + 6;
            sonucData.irade = sonucData.irade + 7;
            sonucData.ego = sonucData.ego + 8;
            sonucData.sadakat = sonucData.sadakat + 3;
            sonucData.merhamet = sonucData.merhamet + 8;
            sonucData.sorumluluk = sonucData.sorumluluk + 5;
            sonucData.count = sonucData.count + 1;
        }
        if (ddSaat > 24) {

            sonucData.duygusallik = sonucData.duygusallik + 8;
            sonucData.sinirlilik = sonucData.sinirlilik + 7;
            sonucData.irade = sonucData.irade + 10;
            sonucData.ego = sonucData.ego + 3;
            sonucData.sadakat = sonucData.sadakat + 10;
            sonucData.merhamet = sonucData.merhamet + 7;
            sonucData.sorumluluk = sonucData.sorumluluk + 10;
            sonucData.count = sonucData.count + 1;
        }

        

    } catch (error) { }


    if (data.erkek) {

        sonucData.duygusallik = (sonucData.duygusallik + 9)
        sonucData.sinirlilik = (sonucData.sinirlilik + 2)
        sonucData.irade = (sonucData.irade + 3)
        sonucData.ego = (sonucData.ego + 3)
        sonucData.sadakat = (sonucData.sadakat + 5)
        sonucData.merhamet = (sonucData.merhamet + 8)
        sonucData.sorumluluk = (sonucData.sorumluluk + 10)
        sonucData.count = sonucData.count +1
    } 
    if (data.kiz) {

        sonucData.duygusallik = (sonucData.duygusallik + 3)
        sonucData.sinirlilik = (sonucData.sinirlilik + 2)
        sonucData.irade = (sonucData.irade + 3)
        sonucData.ego = (sonucData.ego + 10)
        sonucData.sadakat = (sonucData.sadakat + 2)
        sonucData.merhamet = (sonucData.merhamet + 6)
        sonucData.sorumluluk = (sonucData.sorumluluk + 1)
        sonucData.count = sonucData.count +1
    } 


    if (data.boy>140) {

        sonucData.duygusallik = sonucData.duygusallik + 1;
        sonucData.sinirlilik = sonucData.sinirlilik + 10;
        sonucData.irade = sonucData.irade + 1;
        sonucData.ego = sonucData.ego + 3;
        sonucData.sadakat = sonucData.sadakat + 0;
        sonucData.merhamet = sonucData.merhamet + 1;
        sonucData.sorumluluk = sonucData.sorumluluk + 9;
        sonucData.count = sonucData.count + 1;
    } 

    if (data.boy>150) {

        sonucData.duygusallik = sonucData.duygusallik + 6;
        sonucData.sinirlilik = sonucData.sinirlilik + 8;
        sonucData.irade = sonucData.irade + 6;
        sonucData.ego = sonucData.ego + 10;
        sonucData.sadakat = sonucData.sadakat + 7;
        sonucData.merhamet = sonucData.merhamet + 8;
        sonucData.sorumluluk = sonucData.sorumluluk + 7;
        sonucData.count = sonucData.count + 1;
    } 

    if (data.boy>160) {

        sonucData.duygusallik = sonucData.duygusallik + 8;
        sonucData.sinirlilik = sonucData.sinirlilik + 4;
        sonucData.irade = sonucData.irade + 8;
        sonucData.ego = sonucData.ego + 1;
        sonucData.sadakat = sonucData.sadakat + 4;
        sonucData.merhamet = sonucData.merhamet + 2;
        sonucData.sorumluluk = sonucData.sorumluluk + 9;
        sonucData.count = sonucData.count + 1;
    } 
    if (data.boy>170) {

        sonucData.duygusallik = sonucData.duygusallik + 10;
        sonucData.sinirlilik = sonucData.sinirlilik + 10;
        sonucData.irade = sonucData.irade + 10;
        sonucData.ego = sonucData.ego + 5;
        sonucData.sadakat = sonucData.sadakat + 18;
        sonucData.merhamet = sonucData.merhamet + 10;
        sonucData.sorumluluk = sonucData.sorumluluk + 9;
        sonucData.count = sonucData.count + 1;
    } 

    if (data.boy>190) {

        sonucData.duygusallik = sonucData.duygusallik + 8;
        sonucData.sinirlilik = sonucData.sinirlilik + 4;
        sonucData.irade = sonucData.irade + 8;
        sonucData.ego = sonucData.ego + 1;
        sonucData.sadakat = sonucData.sadakat + 4;
        sonucData.merhamet = sonucData.merhamet + 2;
        sonucData.sorumluluk = sonucData.sorumluluk + 9;
        sonucData.count = sonucData.count + 1;
    }
    if (data.boy>210) {

        sonucData.duygusallik = sonucData.duygusallik + 6;
        sonucData.sinirlilik = sonucData.sinirlilik + 8;
        sonucData.irade = sonucData.irade + 6;
        sonucData.ego = sonucData.ego + 10;
        sonucData.sadakat = sonucData.sadakat + 7;
        sonucData.merhamet = sonucData.merhamet + 8;
        sonucData.sorumluluk = sonucData.sorumluluk + 7;
        sonucData.count = sonucData.count + 1;
    }




    if (data.anneYas>25) {

        sonucData.duygusallik = sonucData.duygusallik + 9;
        sonucData.sinirlilik = sonucData.sinirlilik + 2;
        sonucData.irade = sonucData.irade + 3;
        sonucData.ego = sonucData.ego + 3;
        sonucData.sadakat = sonucData.sadakat + 5;
        sonucData.merhamet = sonucData.merhamet + 8;
        sonucData.sorumluluk = sonucData.sorumluluk + 10;
        sonucData.count = sonucData.count + 1;
    } 
    if (data.anneYas>30) {

        sonucData.duygusallik = sonucData.duygusallik + 0;
        sonucData.sinirlilik = sonucData.sinirlilik + 9;
        sonucData.irade = sonucData.irade + 8;
        sonucData.ego = sonucData.ego + 7;
        sonucData.sadakat = sonucData.sadakat + 0;
        sonucData.merhamet = sonucData.merhamet + 8;
        sonucData.sorumluluk = sonucData.sorumluluk + 0;
        sonucData.count = sonucData.count + 1;
    } 


    if (data.anneYas>35) {

        sonucData.duygusallik = sonucData.duygusallik + 1;
        sonucData.sinirlilik = sonucData.sinirlilik + 10;
        sonucData.irade = sonucData.irade + 1;
        sonucData.ego = sonucData.ego + 3;
        sonucData.sadakat = sonucData.sadakat + 0;
        sonucData.merhamet = sonucData.merhamet + 1;
        sonucData.sorumluluk = sonucData.sorumluluk + 9;
        sonucData.count = sonucData.count + 1;
    } 

    if (data.anneYas>40) {

        sonucData.duygusallik = sonucData.duygusallik + 6;
        sonucData.sinirlilik = sonucData.sinirlilik + 8;
        sonucData.irade = sonucData.irade + 6;
        sonucData.ego = sonucData.ego + 10;
        sonucData.sadakat = sonucData.sadakat + 7;
        sonucData.merhamet = sonucData.merhamet + 8;
        sonucData.sorumluluk = sonucData.sorumluluk + 7;
        sonucData.count = sonucData.count + 1;
    } 

    if (data.anneYas>45) {

        sonucData.duygusallik = sonucData.duygusallik + 8;
        sonucData.sinirlilik = sonucData.sinirlilik + 4;
        sonucData.irade = sonucData.irade + 8;
        sonucData.ego = sonucData.ego + 1;
        sonucData.sadakat = sonucData.sadakat + 4;
        sonucData.merhamet = sonucData.merhamet + 2;
        sonucData.sorumluluk = sonucData.sorumluluk + 9;
        sonucData.count = sonucData.count + 1;
    } 
    if (data.anneYas>50) {

        sonucData.duygusallik = sonucData.duygusallik + 10;
        sonucData.sinirlilik = sonucData.sinirlilik + 10;
        sonucData.irade = sonucData.irade + 10;
        sonucData.ego = sonucData.ego + 5;
        sonucData.sadakat = sonucData.sadakat + 18;
        sonucData.merhamet = sonucData.merhamet + 10;
        sonucData.sorumluluk = sonucData.sorumluluk + 9;
        sonucData.count = sonucData.count + 1;
    } 

    if (data.anneYas>55) {

        sonucData.duygusallik = sonucData.duygusallik + 8;
        sonucData.sinirlilik = sonucData.sinirlilik + 4;
        sonucData.irade = sonucData.irade + 8;
        sonucData.ego = sonucData.ego + 1;
        sonucData.sadakat = sonucData.sadakat + 4;
        sonucData.merhamet = sonucData.merhamet + 2;
        sonucData.sorumluluk = sonucData.sorumluluk + 9;
        sonucData.count = sonucData.count + 1;
    } 
    if (data.anneYas>60) {

        sonucData.duygusallik = sonucData.duygusallik + 6;
        sonucData.sinirlilik = sonucData.sinirlilik + 8;
        sonucData.irade = sonucData.irade + 6;
        sonucData.ego = sonucData.ego + 10;
        sonucData.sadakat = sonucData.sadakat + 7;
        sonucData.merhamet = sonucData.merhamet + 8;
        sonucData.sorumluluk = sonucData.sorumluluk + 7;
        sonucData.count = sonucData.count + 1;
    }

    if (data.anneYas>65) {

        sonucData.duygusallik = sonucData.duygusallik + 9;
        sonucData.sinirlilik = sonucData.sinirlilik + 2;
        sonucData.irade = sonucData.irade + 3;
        sonucData.ego = sonucData.ego + 3;
        sonucData.sadakat = sonucData.sadakat + 5;
        sonucData.merhamet = sonucData.merhamet + 8;
        sonucData.sorumluluk = sonucData.sorumluluk + 10;
        sonucData.count = sonucData.count + 1;
    } 
    if (data.anneYas>70) {

        sonucData.duygusallik = sonucData.duygusallik + 0;
        sonucData.sinirlilik = sonucData.sinirlilik + 9;
        sonucData.irade = sonucData.irade + 8;
        sonucData.ego = sonucData.ego + 7;
        sonucData.sadakat = sonucData.sadakat + 0;
        sonucData.merhamet = sonucData.merhamet + 8;
        sonucData.sorumluluk = sonucData.sorumluluk + 0;
        sonucData.count = sonucData.count + 1;
    } 


    if (data.anneYas>75) {

        sonucData.duygusallik = sonucData.duygusallik + 1;
        sonucData.sinirlilik = sonucData.sinirlilik + 10;
        sonucData.irade = sonucData.irade + 1;
        sonucData.ego = sonucData.ego + 3;
        sonucData.sadakat = sonucData.sadakat + 0;
        sonucData.merhamet = sonucData.merhamet + 1;
        sonucData.sorumluluk = sonucData.sorumluluk + 9;
        sonucData.count = sonucData.count + 1;
    } 

    if (data.anneYas>80) {

        sonucData.duygusallik = sonucData.duygusallik + 6;
        sonucData.sinirlilik = sonucData.sinirlilik + 8;
        sonucData.irade = sonucData.irade + 6;
        sonucData.ego = sonucData.ego + 10;
        sonucData.sadakat = sonucData.sadakat + 7;
        sonucData.merhamet = sonucData.merhamet + 8;
        sonucData.sorumluluk = sonucData.sorumluluk + 7;
        sonucData.count = sonucData.count + 1;
    } 

    if (data.anneYas>85) {

        sonucData.duygusallik = sonucData.duygusallik + 8;
        sonucData.sinirlilik = sonucData.sinirlilik + 4;
        sonucData.irade = sonucData.irade + 8;
        sonucData.ego = sonucData.ego + 1;
        sonucData.sadakat = sonucData.sadakat + 4;
        sonucData.merhamet = sonucData.merhamet + 2;
        sonucData.sorumluluk = sonucData.sorumluluk + 9;
        sonucData.count = sonucData.count + 1;
    } 
    if (data.anneYas>90) {

        sonucData.duygusallik = sonucData.duygusallik + 8;
        sonucData.sinirlilik = sonucData.sinirlilik + 4;
        sonucData.irade = sonucData.irade + 8;
        sonucData.ego = sonucData.ego + 1;
        sonucData.sadakat = sonucData.sadakat + 4;
        sonucData.merhamet = sonucData.merhamet + 2;
        sonucData.sorumluluk = sonucData.sorumluluk + 9;
        sonucData.count = sonucData.count + 1;
    } 
    if (data.anneYas>95) {

        sonucData.duygusallik = sonucData.duygusallik + 10;
        sonucData.sinirlilik = sonucData.sinirlilik + 10;
        sonucData.irade = sonucData.irade + 10;
        sonucData.ego = sonucData.ego + 5;
        sonucData.sadakat = sonucData.sadakat + 18;
        sonucData.merhamet = sonucData.merhamet + 10;
        sonucData.sorumluluk = sonucData.sorumluluk + 9;
        sonucData.count = sonucData.count + 1;
    } 

    if (data.anneYas>100) {

        sonucData.duygusallik = sonucData.duygusallik + 8;
        sonucData.sinirlilik = sonucData.sinirlilik + 4;
        sonucData.irade = sonucData.irade + 8;
        sonucData.ego = sonucData.ego + 1;
        sonucData.sadakat = sonucData.sadakat + 4;
        sonucData.merhamet = sonucData.merhamet + 2;
        sonucData.sorumluluk = sonucData.sorumluluk + 9;
        sonucData.count = sonucData.count + 1;
    } 


////baba Yas
if (data.babaYas>25) {

  
    sonucData.duygusallik = sonucData.duygusallik + 0;
    sonucData.sinirlilik = sonucData.sinirlilik + 9;
    sonucData.irade = sonucData.irade + 8;
    sonucData.ego = sonucData.ego + 7;
    sonucData.sadakat = sonucData.sadakat + 0;
    sonucData.merhamet = sonucData.merhamet + 8;
    sonucData.sorumluluk = sonucData.sorumluluk + 0;
    sonucData.count = sonucData.count + 1;
} 
if (data.babaYas>30) {



    sonucData.duygusallik = sonucData.duygusallik + 1;
    sonucData.sinirlilik = sonucData.sinirlilik + 10;
    sonucData.irade = sonucData.irade + 1;
    sonucData.ego = sonucData.ego + 3;
    sonucData.sadakat = sonucData.sadakat + 0;
    sonucData.merhamet = sonucData.merhamet + 1;
    sonucData.sorumluluk = sonucData.sorumluluk + 9;
    sonucData.count = sonucData.count + 1;
} 


if (data.babaYas>35) {



    sonucData.duygusallik = sonucData.duygusallik + 6;
    sonucData.sinirlilik = sonucData.sinirlilik + 8;
    sonucData.irade = sonucData.irade + 6;
    sonucData.ego = sonucData.ego + 10;
    sonucData.sadakat = sonucData.sadakat + 7;
    sonucData.merhamet = sonucData.merhamet + 8;
    sonucData.sorumluluk = sonucData.sorumluluk + 7;
    sonucData.count = sonucData.count + 1;
} 

if (data.babaYas>40) {

    

    sonucData.duygusallik = sonucData.duygusallik + 8;
    sonucData.sinirlilik = sonucData.sinirlilik + 4;
    sonucData.irade = sonucData.irade + 8;
    sonucData.ego = sonucData.ego + 1;
    sonucData.sadakat = sonucData.sadakat + 4;
    sonucData.merhamet = sonucData.merhamet + 2;
    sonucData.sorumluluk = sonucData.sorumluluk + 9;
    sonucData.count = sonucData.count + 1;
} 

if (data.babaYas>45) {

 
    sonucData.duygusallik = sonucData.duygusallik + 10;
    sonucData.sinirlilik = sonucData.sinirlilik + 10;
    sonucData.irade = sonucData.irade + 10;
    sonucData.ego = sonucData.ego + 5;
    sonucData.sadakat = sonucData.sadakat + 18;
    sonucData.merhamet = sonucData.merhamet + 10;
    sonucData.sorumluluk = sonucData.sorumluluk + 9;
    sonucData.count = sonucData.count + 1;
} 
if (data.babaYas>50) {



    sonucData.duygusallik = sonucData.duygusallik + 8;
    sonucData.sinirlilik = sonucData.sinirlilik + 4;
    sonucData.irade = sonucData.irade + 8;
    sonucData.ego = sonucData.ego + 1;
    sonucData.sadakat = sonucData.sadakat + 4;
    sonucData.merhamet = sonucData.merhamet + 2;
    sonucData.sorumluluk = sonucData.sorumluluk + 9;
    sonucData.count = sonucData.count + 1;
} 

if (data.babaYas>55) {

  
    sonucData.duygusallik = sonucData.duygusallik + 6;
    sonucData.sinirlilik = sonucData.sinirlilik + 8;
    sonucData.irade = sonucData.irade + 6;
    sonucData.ego = sonucData.ego + 10;
    sonucData.sadakat = sonucData.sadakat + 7;
    sonucData.merhamet = sonucData.merhamet + 8;
    sonucData.sorumluluk = sonucData.sorumluluk + 7;
    sonucData.count = sonucData.count + 1;
} 
if (data.babaYas>60) {

    

    sonucData.duygusallik = sonucData.duygusallik + 9;
    sonucData.sinirlilik = sonucData.sinirlilik + 2;
    sonucData.irade = sonucData.irade + 3;
    sonucData.ego = sonucData.ego + 3;
    sonucData.sadakat = sonucData.sadakat + 5;
    sonucData.merhamet = sonucData.merhamet + 8;
    sonucData.sorumluluk = sonucData.sorumluluk + 10;
    sonucData.count = sonucData.count + 1;
}

if (data.babaYas>65) {


    sonucData.duygusallik = sonucData.duygusallik + 0;
    sonucData.sinirlilik = sonucData.sinirlilik + 9;
    sonucData.irade = sonucData.irade + 8;
    sonucData.ego = sonucData.ego + 7;
    sonucData.sadakat = sonucData.sadakat + 0;
    sonucData.merhamet = sonucData.merhamet + 8;
    sonucData.sorumluluk = sonucData.sorumluluk + 0;
    sonucData.count = sonucData.count + 1;
} 
if (data.babaYas>70) {

   

    sonucData.duygusallik = sonucData.duygusallik + 1;
    sonucData.sinirlilik = sonucData.sinirlilik + 10;
    sonucData.irade = sonucData.irade + 1;
    sonucData.ego = sonucData.ego + 3;
    sonucData.sadakat = sonucData.sadakat + 0;
    sonucData.merhamet = sonucData.merhamet + 1;
    sonucData.sorumluluk = sonucData.sorumluluk + 9;
    sonucData.count = sonucData.count + 1;
} 


if (data.babaYas>75) {

  
    sonucData.duygusallik = sonucData.duygusallik + 6;
    sonucData.sinirlilik = sonucData.sinirlilik + 8;
    sonucData.irade = sonucData.irade + 6;
    sonucData.ego = sonucData.ego + 10;
    sonucData.sadakat = sonucData.sadakat + 7;
    sonucData.merhamet = sonucData.merhamet + 8;
    sonucData.sorumluluk = sonucData.sorumluluk + 7;
    sonucData.count = sonucData.count + 1;
} 

if (data.babaYas>80) {

   
    sonucData.duygusallik = sonucData.duygusallik + 8;
    sonucData.sinirlilik = sonucData.sinirlilik + 4;
    sonucData.irade = sonucData.irade + 8;
    sonucData.ego = sonucData.ego + 1;
    sonucData.sadakat = sonucData.sadakat + 4;
    sonucData.merhamet = sonucData.merhamet + 2;
    sonucData.sorumluluk = sonucData.sorumluluk + 9;
    sonucData.count = sonucData.count + 1;
} 

if (data.babaYas>85) {

 
    sonucData.duygusallik = sonucData.duygusallik + 8;
    sonucData.sinirlilik = sonucData.sinirlilik + 4;
    sonucData.irade = sonucData.irade + 8;
    sonucData.ego = sonucData.ego + 1;
    sonucData.sadakat = sonucData.sadakat + 4;
    sonucData.merhamet = sonucData.merhamet + 2;
    sonucData.sorumluluk = sonucData.sorumluluk + 9;
    sonucData.count = sonucData.count + 1;
} 
if (data.babaYas>90) {

   
    sonucData.duygusallik = sonucData.duygusallik + 10;
    sonucData.sinirlilik = sonucData.sinirlilik + 10;
    sonucData.irade = sonucData.irade + 10;
    sonucData.ego = sonucData.ego + 5;
    sonucData.sadakat = sonucData.sadakat + 18;
    sonucData.merhamet = sonucData.merhamet + 10;
    sonucData.sorumluluk = sonucData.sorumluluk + 9;
    sonucData.count = sonucData.count + 1;
} 
if (data.babaYas>95) {

 
    sonucData.duygusallik = sonucData.duygusallik + 10;
    sonucData.sinirlilik = sonucData.sinirlilik + 10;
    sonucData.irade = sonucData.irade + 10;
    sonucData.ego = sonucData.ego + 5;
    sonucData.sadakat = sonucData.sadakat + 18;
    sonucData.merhamet = sonucData.merhamet + 10;
    sonucData.sorumluluk = sonucData.sorumluluk + 9;
    sonucData.count = sonucData.count + 1;
} 

if (data.babaYas>100) {

    sonucData.duygusallik = sonucData.duygusallik + 5;
    sonucData.sinirlilik = sonucData.sinirlilik + 2;
    sonucData.irade = sonucData.irade + 3;
    sonucData.ego = sonucData.ego + 3;
    sonucData.sadakat = sonucData.sadakat + 7;
    sonucData.merhamet = sonucData.merhamet + 8;
    sonucData.sorumluluk = sonucData.sorumluluk + 10;
    sonucData.count = sonucData.count + 1;
} 
    
sonucData.duygusallik = ((sonucData.duygusallik /sonucData.count)*10).toFixed();
sonucData.sinirlilik = ((sonucData.sinirlilik /sonucData.count)*10).toFixed();
sonucData.irade = ((sonucData.irade /sonucData.count)*10).toFixed();
sonucData.ego = ((sonucData.ego/sonucData.count)*10).toFixed();
sonucData.sadakat = ((sonucData.sadakat /sonucData.count)*10).toFixed();
sonucData.merhamet = ((sonucData.merhamet /sonucData.count)*10).toFixed();
sonucData.sorumluluk = ((sonucData.sorumluluk /sonucData.count)*10).toFixed();



var ort = (parseInt(sonucData.duygusallik) + parseInt(sonucData.ego) + parseInt(sonucData.irade) + parseInt(sonucData.merhamet) + parseInt(sonucData.sadakat) + parseInt(sonucData.sinirlilik) + parseInt(sonucData.sorumluluk)) / 7

if (ort >= 30) {
    sonucData.crk1=-45
    sonucData.crk2=130
}
if (ort >= 32) {
   sonucData.crk1=0
   sonucData.crk2=-45
}
if (ort >= 35) {
    sonucData.crk1=130
    sonucData.crk2=220
}
if (ort >= 36) {
    sonucData.crk1=(180)
    sonucData.crk2=-45
}
if (ort >= 37) {
    sonucData.crk1=(220)
    sonucData.crk2=130
}
if (ort >= 39) {
    sonucData.crk1=(-90)
    sonucData.crk2=0
}
if (ort >= 41) {
    sonucData.crk1=(-45)
    sonucData.crk2=180
}
if (ort >= 43) {
    sonucData.crk1=(0)
    sonucData.crk2=130
}
if (ort >= 44) {
    sonucData.crk1=(130)
    sonucData.crk2=0
}
if (ort >= 45) {
    sonucData.crk1=(180)
    sonucData.crk2=-45
}
if (ort >= 47) {
    sonucData.crk1=(220)
    sonucData.crk2=-45
}
if (ort >= 49) {
    sonucData.crk1=(130)
    sonucData.crk2=0
}
if (ort >= 50) {
    sonucData.crk1=(220)
    sonucData.crk2=130
}
if (ort >= 51) {
    sonucData.crk1=(-90)
    sonucData.crk2=-90
}
if (ort >= 52) {
    sonucData.crk1=(-45)
    sonucData.crk2=130
}
if (ort >= 54) {
    sonucData.crk1=(0)
    sonucData.crk2=220
}
if (ort >= 56) {
    sonucData.crk1=(130)
    sonucData.crk2=220
}
if (ort >= 58) {
    sonucData.crk1=(180)
    sonucData.crk2=220
}
if (ort >= 59) {
    sonucData.crk1=(220)
    sonucData.crk2=-45
}
if (ort >= 59.10) {
    sonucData.crk1=(0)
    sonucData.crk2=180
}
if (ort >= 60) {
    sonucData.crk1=(-45)
    sonucData.crk2=220
}
if (ort >= 61) {
    sonucData.crk1=(0)
    sonucData.crk2=130
}
if (ort >= 62) {
    sonucData.crk1=(130)
    sonucData.crk2=0
}
if (ort >= 62) {
    sonucData.crk1=(0)
    sonucData.crk2=180
}
if (ort >= 63) {
    sonucData.crk1=(220)
    sonucData.crk2=0
}
if (ort >= 64) {
    sonucData.crk1=(-45)
    sonucData.crk2=220
}
if (ort >= 65) {
    sonucData.crk1=(0)
    sonucData.crk2=180
}
if (ort >= 66) {
    sonucData.crk1=(0)
    sonucData.crk2=220
}
if (ort >= 67) {
    sonucData.crk1=(220)
    sonucData.crk2=0
}
if (ort >= 68) {
    sonucData.crk1=(130)
    sonucData.crk2=-45
}
if (ort >= 69) {
    sonucData.crk1=(180)
    sonucData.crk2=0
}
if (ort >= 70) {
    sonucData.crk1=(220)
    sonucData.crk2=-45
}
if (ort >= 71) {
    sonucData.crk1=(180)
    sonucData.crk2=220
}
if (ort >= 72) {
    sonucData.crk1=(0)
    sonucData.crk2=130
}
if (ort >= 73) {
    sonucData.crk1=(220)
    sonucData.crk2=-45
}
if (ort >= 74) {
    sonucData.crk1=(180)
    sonucData.crk2=0
}
if (ort >= 75) {
    sonucData.crk1=(0)
    sonucData.crk2=130
}
if (ort >= 76) {
    sonucData.crk1=(220)
    sonucData.crk2=0
}
if (ort >= 77) {
    sonucData.crk1=(-45)
    sonucData.crk2=180
}
if (ort >= 78) {
    sonucData.crk1=(220)
    sonucData.crk2=0
}
sonucData.ort=ort



    return sonucData
}

export default carkCalculator;