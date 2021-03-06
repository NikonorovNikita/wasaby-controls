import { assert } from 'chai';
import { spy } from 'sinon';
import { Collection } from 'Controls/display';
import { RecordSet } from 'Types/collection';
import { ScrollController } from 'Controls/list';
import * as Env from 'Env/Env';
import * as sinon from 'sinon';

describe('Controls/list_clean/ScrollController', () => {
    const items = new RecordSet({
        rawData: [],
        keyProperty: 'key'
    });
    describe('constructor', () => {
        it('needScrollCalculation === true.', () => {
            const collection = new Collection({
                collection: items
            });
            const setViewIteratorSpy = spy(collection, 'setViewIterator');
            const controller = new ScrollController({
                collection,
                virtualScrollConfig: {},
                useNewModel: true,
                needScrollCalculation: true
            });
            controller.handleResetItems();

            assert.isTrue(setViewIteratorSpy.called);
        });
        it('needScrollCalculation === false.', () => {
            const collection = new Collection({
                collection: items
            });
            const setViewIteratorSpy = spy(collection, 'setViewIterator');
            const controller = new ScrollController({
                collection,
                virtualScrollConfig: {},
                useNewModel: true,
                needScrollCalculation: false
            });
            controller.handleResetItems();

            assert.isFalse(setViewIteratorSpy.called);
        });
        it('collection === null.', () => {
            let controller;
            let errorFired = false;
            try {
                controller = new ScrollController({
                    collection: null,
                    virtualScrollConfig: {},
                    useNewModel: true,
                    needScrollCalculation: false
                });
             } catch (e) {
                errorFired = true;
             }
            assert.isFalse(errorFired);
        });
    });

    describe('update', () => {
        it('needScrollCalculation === true.', () => {
            const collection = new Collection({
                collection: items
            });
            const controller = new ScrollController({
                collection,
                virtualScrollConfig: {},
                useNewModel: true,
                needScrollCalculation: true
            });
            controller.handleResetItems();

            const newCollection = new Collection({
                collection: items
            });
            const setViewIteratorSpy = spy(newCollection, 'setViewIterator');
            controller.update({
                options: {
                    collection: newCollection,
                    virtualScrollConfig: {},
                    useNewModel: true,
                    needScrollCalculation: false
                },
                params: {}
            });
            assert.isFalse(setViewIteratorSpy.called);
        });
        it('needScrollCalculation === false.', () => {
            const collection = new Collection({
                collection: items
            });
            const controller = new ScrollController({
                collection,
                virtualScrollConfig: {},
                useNewModel: true,
                needScrollCalculation: false
            });
            controller.handleResetItems();

            const newCollection = new Collection({
                collection: items
            });
            const setViewIteratorSpy = spy(newCollection, 'setViewIterator');
            controller.update({
                options: {
                    collection: newCollection,
                    virtualScrollConfig: {},
                    useNewModel: true,
                    needScrollCalculation: true
                }
            });
            assert.isTrue(setViewIteratorSpy.called);
        });
    });

    describe('attachLoadTopTriggerToNull', () => {
        describe('mount', () => {
            it('attachLoadTopTriggerToNull === true', () => {
                const collection = new Collection({
                    collection: items
                });
                const controller = new ScrollController({
                    collection,
                    virtualScrollConfig: {},
                    needScrollCalculation: false,
                    attachLoadTopTriggerToNull: true
                });
                controller.handleResetItems();

                let result = controller.update({
                    options: {
                        collection,
                        virtualScrollConfig: {},
                        needScrollCalculation: false,
                        attachLoadTopTriggerToNull: true
                    },
                    params: {clientHeight: 100, scrollHeight: 300, scrollTop: 0}
                });

                assert.strictEqual(result.triggerOffset.top, 0);
            });
            it('attachLoadTopTriggerToNull === false', () => {
                const collection = new Collection({
                    collection: items
                });
                const controller = new ScrollController({
                    collection,
                    virtualScrollConfig: {},
                    needScrollCalculation: false,
                    attachLoadTopTriggerToNull: false
                });
                controller.handleResetItems();

                let result = controller.update({
                    options: {
                        collection,
                        virtualScrollConfig: {},
                        needScrollCalculation: false,
                        attachLoadTopTriggerToNull: false
                    }, params: {clientHeight: 100, scrollHeight: 300, scrollTop: 0}
                });

                assert.strictEqual(result.triggerOffset.top, 30);
            });
        });
        describe('update', () => {
            it('attachLoadTopTriggerToNull === true -> false', () => {
                const collection = new Collection({
                    collection: items
                });
                let options = {
                    collection,
                    virtualScrollConfig: {},
                    needScrollCalculation: false,
                    attachLoadTopTriggerToNull: true
                };
                const controller = new ScrollController(options);
                controller.handleResetItems();

                let result = controller.update({
                    options: {
                        collection,
                        virtualScrollConfig: {},
                        needScrollCalculation: false,
                        attachLoadTopTriggerToNull: false
                    },
                    params: {clientHeight: 100, scrollHeight: 300, scrollTop: 0}
                });


                assert.strictEqual(result.triggerOffset.top, 30);
            });
            it('update with new scrollHeight === 0', () => {
                const collection = new Collection({
                    collection: items
                });
                let options = {
                    collection,
                    virtualScrollConfig: {},
                    needScrollCalculation: false,
                    attachLoadTopTriggerToNull: false
                };
                const controller = new ScrollController(options);
                controller.handleResetItems();

                let result = controller.update({
                    options: {},
                    params: {clientHeight: 100, scrollHeight: 300, scrollTop: 0}
                });
                assert.strictEqual(result.triggerOffset.top, 30);
                
                result = controller.update({
                    options: {},
                    params: {clientHeight: 100, scrollHeight: 0, scrollTop: 0}
                });
                assert.strictEqual(result.triggerOffset.top, 0);
            });
        });
    });

    describe('scrollToItem', () => {
        it('rangeChanged', (done) => {
            const collection = new Collection({
                collection: new RecordSet({
                    rawData: [ { key: '1'}, { key: '2'} ],
                    keyProperty: 'key'
                })
            });
            const options = {
                collection,
                virtualScrollConfig: {pageSize: 1},
                needScrollCalculation: true
            };
            let scrollCallbackCalled = false;
            const scrollCallback = () => {
                scrollCallbackCalled = true;
            };
            const controller = new ScrollController(options);
            controller.handleResetItems();
            controller.update({params: {scrollHeight: 2, clientHeight: 1, scrollTop: 0}, options: null});
            controller.scrollToItem('1', false, true, scrollCallback).then(() => {
                assert.isTrue(scrollCallbackCalled, 'should scroll after updateItemHeights');
                done();
            });
            assert.isFalse(scrollCallbackCalled, 'should not scroll if rangeChanged');
            controller.updateItemsHeights({itemsHeights: [1, 1], itemsOffsets: [0, 1]});
            controller.continueScrollToItemIfNeed();

        });
    });

    describe('updateItemsHeights', () => {
        it('rangeChanged', () => {
            const collection = new Collection({
                collection: new RecordSet({
                    rawData: [ { id: '1'} ]
                })
            });
            const options = {
                collection,
                virtualScrollConfig: {pageSize: 1},
                needScrollCalculation: true
            };
            const controller = new ScrollController(options);
            controller.handleResetItems();
            assert.isTrue(controller.updateItemsHeights({itemsHeights: [], itemsOffsets: []}));
            assert.isFalse(controller.updateItemsHeights({itemsHeights: [], itemsOffsets: []}));

        });
    });

    describe('scrollPositionChange', () => {
        it('virtual', () => {
            const collection = new Collection({
                collection: new RecordSet({
                    rawData: [ { id: '1'} ]
                })
            });
            const options = {
                collection,
                virtualScrollConfig: {pageSize: 1},
                needScrollCalculation: true
            };
            const controller = new ScrollController(options);
            let applyScrollTopCallbackCalled = false;
            const applyScrollTopCallback = () => applyScrollTopCallbackCalled = true;
            controller.scrollPositionChange({scrollTop: 0, scrollHeight: 100, clientHeight: 50, applyScrollTopCallback}, true);
            assert.isFalse(applyScrollTopCallbackCalled);
        });
    });

    describe('inertialScrolling', () => {
        let clock;
        beforeEach(() => {
            Env.detection.isMobileIOS = true;
            clock = sinon.useFakeTimers();
        });

        afterEach(() => {
            if (typeof window === 'undefined') {
                Env.detection.isMobileIOS = undefined;
            } else {
                Env.detection.isMobileIOS = false;
            }
            clock.restore();
        });
        const collection = new Collection({
            collection: items
        });
        let options = {
            collection,
            virtualScrollConfig: {},
            needScrollCalculation: false
        };
        const controller = new ScrollController(options);
        controller.handleResetItems();

        it('inertialScrolling created', () => {
            assert.isOk(controller._inertialScrolling);
        });
        it('callAfterScrollStopped', () => {

            let callbackCalled = false;
            let callback = () => {
                callbackCalled = true;
            };
            controller.callAfterScrollStopped(callback);
            assert.isTrue(callbackCalled, 'callback must be called');
            callbackCalled = false;

            controller.scrollPositionChange({scrollTop: 0, scrollHeight: 100, clientHeight: 50}, false);
            controller.callAfterScrollStopped(callback);
            assert.isFalse(callbackCalled, 'callback must be called with delay');
            clock.tick(101);
            assert.isTrue(callbackCalled, 'callback must be called');
        });
    });
});
