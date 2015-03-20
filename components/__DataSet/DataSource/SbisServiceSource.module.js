/**
 * Created by as.manuylov on 10.11.14.
 */
define('js!SBIS3.CONTROLS.SbisServiceSource', [
   'js!SBIS3.CONTROLS.IDataSource',
   'js!SBIS3.CONTROLS.Record',
   'js!SBIS3.CONTROLS.DataSet',
   'js!SBIS3.CONTROLS.SbisJSONStrategy'
], function (IDataSource, Record, DataSet, SbisJSONStrategy) {
   'use strict';

   /**
    * Класс, реализующий интерфейс IDataSource, для работы с бизнес-логикой СБИС как с источником данных
    */

   return IDataSource.extend({
      $protected: {
         _options: {
            strategy: null,
            /**
             * сопоставление CRUD операций и методов БЛ
             */
            queryMethodName: 'Список',
            crateMethodName: 'Создать',
            readMethodName: 'Прочитать',
            updateMethodName: 'Записать',
            destroyMethodName: 'Удалить'
         },
         /**
          * @cfg {$ws.proto.ClientBLObject} Объект, который умеет ходить на бизнес-логику
          */
         _BL: undefined
      },
      $constructor: function (cfg) {
         this._BL = new $ws.proto.ClientBLObject(cfg.service);
         this._options.strategy = cfg.strategy || new SbisJSONStrategy();
      },

      sync: function (dataSet) {
         var self = this,
            syncCompleteDef = new $ws.proto.ParallelDeferred(),
            changedRecords = [];
         dataSet.each(function (record) {
            if (record.getMarkStatus() == 'changed') {
               syncCompleteDef.push(self.update(record));
               changedRecords.push(record);
            }
            if (record.getMarkStatus() == 'deleted') {
               syncCompleteDef.push(self.destroy(record.getKey()));
               changedRecords.push(record);
            }
         }, 'all');

         syncCompleteDef.done().getResult().addCallback(function(){
            self._notify('onDataSync', changedRecords);
         });
      },

      /**
       * Метод создает запись в источнике данных
       * @returns {$ws.proto.Deferred} Асинхронный результат выполнения. В колбэке придет js!SBIS3.CONTROLS.Record
       */
      create: function () {
         var self = this,
            def = new $ws.proto.Deferred();
         self._BL.call(self._options.crateMethodName, {
            'Фильтр': null,
            'ИмяМетода': null
         }, $ws.proto.BLObject.RETURN_TYPE_ASIS).addCallback(function (res) {
            var record = new Record({
               strategy: self.getStrategy(),
               raw: res
               //keyField: self.getStrategy().getKey(res)
            });
            def.callback(record);
         });
         return def;
      },

      /**
       * Метод для чтения записи из БЛ по ее идентификатору
       * @param {Number} id - идентификатор записи
       * @returns {$ws.proto.Deferred} Асинхронный результат выполнения. В колбэке придет js!SBIS3.CONTROLS.Record
       */
      read: function (id) {
         var self = this,
            def = new $ws.proto.Deferred();
         self._BL.call(self._options.readMethodName, {
            'ИдО': id,
            'ИмяМетода': 'Список'
         }, $ws.proto.BLObject.RETURN_TYPE_ASIS).addCallback(function (res) {
            //TODO: переделать установку стратегии стратегию
            var record = new Record({
               'strategy': self.getStrategy(),
               'raw': res
            });
            def.callback(record);
         });
         return def;
      },

      /**
       * Метод для обновления записи на БЛ
       * @param (SBIS3.CONTROLS.Record) record - измененная запись
       * @returns {$ws.proto.Deferred} Асинхронный результат выполнения. В колбэке придет Boolean - результат успешности выполнения операции
       */
      update: function (record) {
         var self = this,
            strategy = this.getStrategy(),
            def = new $ws.proto.Deferred(),
            rec = strategy.prepareRecordForUpdate(record);

         self._BL.call(self._options.updateMethodName, {'Запись': rec}, $ws.proto.BLObject.RETURN_TYPE_ASIS).addCallback(function (res) {
            def.callback(true);
         });

         return def;
      },

      /**
       * Метод для удаления записи из БЛ
       * @param {Array | Number} id - идентификатор записи или массив идентификаторов
       * @returns {$ws.proto.Deferred} Асинхронный результат выполнения. В колбэке придет Boolean - результат успешности выполнения операции
       */
      destroy: function (id) {
         var self = this,
            def = new $ws.proto.Deferred();

         self._BL.call(self._options.destroyMethodName, {'ИдО': id}, $ws.proto.BLObject.RETURN_TYPE_ASIS).addCallback(function (res) {
            def.callback(true);
         });

         return def;
      },

      /**
       * Вызов списочного метода БЛ
       * Возможно применене фильтрации, сортировки и выбора определенного количества записей с заданной позиции
       * @param {Object} filter - {property1: value, property2: value}
       * @param {Array} sorting - [{property1: 'ASC'},{property2: 'DESC'}]
       * @param {Number} offset смещение начала выборки
       * @param {Number} limit количество возвращаемых записей
       * @returns {$ws.proto.Deferred} Асинхронный результат выполнения. В колбэке придет js!SBIS3.CONTROLS.DataSet - набор отобранных элементов
       */
      query: function (filter, sorting, offset, limit) {
         filter = filter || {};
         var
            self = this,
            strategy = this.getStrategy(),
            def = new $ws.proto.Deferred(),
            filterParam = strategy.prepareFilterParam(filter),
            sortingParam = strategy.prepareSortingParam(sorting),
            pagingParam = strategy.preparePagingParam(offset, limit);

         self._BL.call(self._options.queryMethodName, {
            'ДопПоля': [],
            'Фильтр': filterParam,
            'Сортировка': sortingParam,
            'Навигация': pagingParam
         }, $ws.proto.BLObject.RETURN_TYPE_ASIS).addCallback(function (res) {

            var DS = new DataSet({
               strategy: strategy,
               data: res
            });

            def.callback(DS);
         });

         return def;

      }

   });
});