import React, { useCallback, useEffect } from 'react';
import _useStore from '../../../store';
import _ from 'lodash';
import axios from 'axios';
import SimpleBar from 'simplebar-react';

import 'simplebar-react/dist/simplebar.min.css';

const PProducts = (props) => {
    const _projects = _useStore.useProjectStore(state => state._projects);
    const setProjects = _useStore.useProjectStore(state => state['_projects_SET_STATE']);

    let _projectItems = _.orderBy(_.uniqBy(_.map(_.union(_.flattenDeep(_.map(_.filter(_projects, (_project) => { return !_project._project_toDisplay }), '_project_tags')), _.map(_.filter(_projects, (_project) => { return !_project._project_toDisplay }), '_project_title')), (_search, _index) => {
        return {
            value: _.toLower(_search.replace(/\.$/, ''))
        }
    }), 'value'), ['value'], ['asc']);

    const _getProjects = useCallback(
        async () => {
            try {
                axios('/api/project')
                    .then((response) => {
                        setProjects(response.data._projects);
                    })
                    .catch((error) => {
                        console.log(error);
                    });
            } catch (error) {
                console.log(error);
            }
        },
        [setProjects]
    );

    useEffect(() => {
        _getProjects();
    }, [_getProjects]);

    return (
        <div className='_pane d-flex flex-column'>
            <div className='_header'>

            </div>
            <div className='_body flex-grow-1'>
                <SimpleBar style={{ maxHeight: '100%' }} forceVisible='y' autoHide={false}>
                    <div>_products</div>
                </SimpleBar>
            </div>
        </div>
    );
}

export default PProducts;