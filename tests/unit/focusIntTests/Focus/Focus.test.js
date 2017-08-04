/**
 * Created by dv.zuev on 18.05.2017.
 */
define([
   'Core/constants',
   'js!SBIS3.CORE.CompoundControl',
   'js!WSTest/Focus/TestFocusHelpers',
   'css!WSTest/Focus/FocusTests'
], function (cConstants,
             focusTestControl,
             fHelpers,
             iHelpers) {
   'use strict';

   var testNum = 1;

   var skipTests = [];//Пропустить тест
   var skipComponent = [13, 14, 15, 16, 17, 18, 19, 20, 26, 30, 32, 33]; //Для асинхронных тестов, аргументом в функцию проверки передается done

   describe('Focus-tests', function () {
      var testControl;
      beforeEach(function () {
         if (typeof $ === 'undefined') {//Проверка того, что тесты выполняются в браузере
            this.skip();
         }
         if (~skipTests.indexOf(testNum)) {
            testNum++;
            this.skip();
         }
         else {
            testNum++;
            $('#mocha').append('<div id="component"></div>');//Для добавления верстки на страницу
         }
      });
      for (var i = 1; i < 34; i++) {
         (function (i) {
            it('Case' + (i), function (done) {
               require(['tmpl!WSTest/Focus/Case' + i, 'js!WSTest/Focus/Scenario/' + i], function (caseTmpl, func) {
                  if (!~skipComponent.indexOf(i)) {
                     var comp = focusTestControl.extend({
                        _dotTplFn: caseTmpl
                     });

                     testControl = new comp({
                        element: 'component',
                        name: 'Case' + i + 'Control'
                     });
                     func(testControl); //Запускаем функцию проверки
                     done();
                  } else {
                     func(done);
                  }
               });
            });
         })(i);
      };
      afterEach(function () {
         testControl && testControl.destroy();
      });
   });
});
