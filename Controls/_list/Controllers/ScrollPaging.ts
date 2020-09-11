/**
 * Created by kraynovdo on 13.11.2017.
 */
import {TNavigationPagingMode} from '../../_interface/INavigation';

/**
 *
 * @author Авраменко А.С.
 * @private
 */

type IScrollpagingState = 'top' | 'bottom' | 'middle';

interface IScrollParams {
    clientHeight: number;
    scrollTop: number;
    scrollHeight: number;
}

type TArrowStateVisibility = 'visible' | 'hidden' | 'readonly';

interface IArrowState {
    begin: TArrowStateVisibility;
    prev: TArrowStateVisibility;
    next: TArrowStateVisibility;
    end: TArrowStateVisibility;
}

interface IPagingCfg {
    arrowState: IArrowState;
    showDigits?: boolean;
    showEndButton?: boolean;
    pagingMode?: string;
    pagesCount?: number;
    selectedPage?: number;
    elementsCount?: number;
}

interface IScrollPagingOptions {
    pagingMode: TNavigationPagingMode;
    scrollParams: IScrollParams;
    totalElementsCount: number;
    loadedElementsCount: number;
    pagingCfgTrigger(cfg: IPagingCfg): void;
}
interface IPagingData {
    totalHeight: number;
}
interface IHasMoreData {
    up: boolean;
    down: boolean;
}

export default class ScrollPagingController {
    protected _curState: IScrollpagingState = null;
    protected _options: IScrollPagingOptions = null;
    protected _pagingData: IPagingData = null;
    protected _numbersState: 'up' | 'down' = 'up';
    constructor(cfg: IScrollPagingOptions, hasMoreData: IHasMoreData = {up: false, down: false}) {
        this._options = cfg;
        this.initializePagingData(cfg);
        this.updateStateByScrollParams(cfg.scrollParams, hasMoreData);
    }

    protected initializePagingData(cfg: IScrollPagingOptions): void {

        const averageElementHeight = this._options.scrollParams.scrollHeight / this._options.loadedElementsCount;
        this._pagingData = {
            totalHeight: averageElementHeight * this._options.totalElementsCount
        };
    }

    setNumbersState(state: 'up' | 'down'): void {
        if (this._options.pagingMode === 'numbers') {
            this._numbersState = state;
        }
    }
    protected isHasMoreData(hasMoreData: boolean): boolean {
        return (!hasMoreData || (this._options.pagingMode !== 'edge' && this._options.pagingMode !== 'end'));
    }

    protected updateStateByScrollParams(scrollParams: IScrollParams, hasMoreData: IHasMoreData): void {
        const canScrollForward = scrollParams.clientHeight + scrollParams.scrollTop < scrollParams.scrollHeight;
        const canScrollBackward = scrollParams.scrollTop > 0;
        if (canScrollForward && canScrollBackward) {
            this.handleScrollMiddle();
        } else if (canScrollForward && !canScrollBackward && this.isHasMoreData(hasMoreData.up)) {
            this.handleScrollTop();
        } else if (!canScrollForward && canScrollBackward && this.isHasMoreData(hasMoreData.down)) {
            this.handleScrollBottom();
        }
    }

    protected getPagingCfg(arrowState: IArrowState): IPagingCfg {
        const pagingCfg: IPagingCfg = {};
        switch (this._options.pagingMode) {
            case 'basic':
                break;

            case 'edge':
                arrowState.prev = 'hidden';
                arrowState.next = 'hidden';
                if (arrowState.end === 'visible') {
                    arrowState.begin = 'hidden';
                    arrowState.end = 'visible';
                    pagingCfg.showEndButton = true;
                } else if (arrowState.begin === 'visible') {
                    arrowState.begin = 'visible';
                    arrowState.end = 'hidden';
                }
                break;

            case 'end':
                arrowState.prev = 'hidden';
                arrowState.next = 'hidden';
                arrowState.begin = 'hidden';

                if (arrowState.end === 'visible') {
                    pagingCfg.showEndButton = true;
                } else {
                    arrowState.end = 'hidden';
                }
                break;

            case 'numbers':
                arrowState.prev = 'hidden';
                arrowState.next = 'hidden';
                arrowState.end = 'visible';
                pagingCfg.showEndButton = true;
                pagingCfg.pagesCount = Math.round(this._pagingData.totalHeight / this._options.scrollParams.clientHeight);
                if (this._numbersState === 'up') {
                    pagingCfg.selectedPage = Math.round(this._options.scrollParams.scrollTop / this._options.scrollParams.clientHeight) + 1;
                } else {
                    const scrollBottom = this._options.scrollParams.scrollHeight - this._options.scrollParams.scrollTop - this._options.scrollParams.clientHeight;
                    pagingCfg.selectedPage = pagingCfg.pagesCount - Math.round(scrollBottom / this._options.scrollParams.clientHeight);
                }
                break;
        }
        if (this._options.pagingMode) {
            pagingCfg.pagingMode = this._options.pagingMode;
            pagingCfg.elementsCount = this._options.totalElementsCount;
        }
        pagingCfg.arrowState = arrowState;
        return pagingCfg;
    }

    getScrollTopByPage() {

    }

    protected handleScrollMiddle(): void {
        if (!(this._curState === 'middle') || this._options.pagingMode === 'numbers') {
            this._options.pagingCfgTrigger(this.getPagingCfg({
                begin: 'visible',
                prev: 'visible',
                next: 'visible',
                end: 'visible'
            }));
            this._curState = 'middle';
        }
    }

    protected handleScrollTop(): void {
        if (!(this._curState === 'top')) {
            this._options.pagingCfgTrigger(this.getPagingCfg({
                begin: 'readonly',
                prev: 'readonly',
                next: 'visible',
                end: 'visible'
            }));
            this._curState = 'top';
        }
    }

    protected handleScrollBottom(): void {
        if (!(this._curState === 'bottom')) {
            this._options.pagingCfgTrigger(this.getPagingCfg({
                begin: 'visible',
                prev: 'visible',
                next: 'readonly',
                end: 'readonly'
            }));
            this._curState = 'bottom';
        }
    }

    public updateScrollParams(scrollParams: IScrollParams, hasMoreData: IHasMoreData = {up: false, down: false}): void {
        this._options.scrollParams = scrollParams;
        this.updateStateByScrollParams(scrollParams, hasMoreData);
    }

    protected destroy(): void {
        this._options = null;
    }

}
