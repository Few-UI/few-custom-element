import set from 'lodash/set';
import few from './few-global';
import { loadJSON } from './few-utils';
import routeSvc, { matchUrl, getPathFromBase } from './few-route-service';

export default class FewRouter {
    constructor( containerElem ) {
        this._elem = containerElem;

        this._currState = null;

        this._routeConfigPromise = null;
    }

    enable() {
        routeSvc.register( this );
    }

    disable() {
        routeSvc.unregister( this );
    }

    loadConfig( configPath ) {
        this._routeConfigPromise = loadJSON( `${configPath}.json` );
    }

    setConfig( config ) {
        this._routeConfigPromise = Promise.resolve( config );
    }

    async processURL( url ) {
        let states = await this._routeConfigPromise;
        if ( states && states.length > 0 ) {
            // let urlStruct = DEFAULT_PARSER( getPathFromBase( url ) );
            let urlParamStr = getPathFromBase( url );
            if( !urlParamStr ) {
                this._currState = states[0];
                this._component = await few.render( `${this._currState.view}.yml`, this._elem );
            } else {
                let state = null;
                let params = {};

                // match state
                for( let key in states ) {
                    let st = states[key];
                    params = matchUrl( st.url, urlParamStr );
                    if( params ) {
                        state = st;
                        break;
                    }
                }

                // process state
                if ( state ) {
                    if ( this._currState === state ) {
                        let model = this._component._vm.model;
                        for( let key in params ) {
                            set( model, key, params[key] );
                        }
                        this._component.updateView();
                    } else {
                        let model = {};
                        for( let key in params ) {
                            set( model, key, params[key] );
                        }
                        this._currState = state;
                        this._component = await few.render( `${state.view}.yml`, this._elem, model );
                    }
                }
            }
        }
    }
}
