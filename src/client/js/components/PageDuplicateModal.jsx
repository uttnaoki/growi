import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';

import {
  Modal, ModalHeader, ModalBody, ModalFooter,
} from 'reactstrap';

import { withTranslation } from 'react-i18next';
import { withUnstatedContainers } from './UnstatedUtils';

import AppContainer from '../services/AppContainer';
import PageContainer from '../services/PageContainer';
import PagePathAutoComplete from './PagePathAutoComplete';
import ApiErrorMessageList from './PageManagement/ApiErrorMessageList';

const PageDuplicateModal = (props) => {
  const { t, appContainer, pageContainer } = props;

  const config = appContainer.getConfig();
  const isReachable = config.isSearchServiceReachable;
  const { pageId, path } = pageContainer.state;
  const { crowi } = appContainer.config;

  const [pageNameInput, setPageNameInput] = useState(path);

  const [errs, setErrs] = useState(null);

  const [subordinatedPaths, setSubordinatedPaths] = useState([]);
  const [getSubordinatedError, setGetSuborinatedError] = useState(null);
  const [isDuplicateRecursively, setIsDuplicateRecursively] = useState(true);
  const [isDuplicateRecursivelyWithoutExistPath, setIsDuplicateRecursivelyWithoutExistPath] = useState(true);
  const [isExist, setIsExist] = useState(false);

  const dummyExistPaths = ['/test146/test147']; // dummyExistPaths is dummy data,deleate after merging GW-3231

  /**
   * change pageNameInput for PagePathAutoComplete
   * @param {string} value
   */
  function ppacInputChangeHandler(value) {
    setPageNameInput(value);
  }

  /**
   * change pageNameInput
   * @param {string} value
   */
  function inputChangeHandler(value) {
    setPageNameInput(value);
  }

  function changeIsDuplicateRecursivelyHandler() {
    setIsDuplicateRecursively(!isDuplicateRecursively);
  }

  function changeIsDuplicateRecursivelyWithoutExistPathHandler() {
    setIsDuplicateRecursivelyWithoutExistPath(!isDuplicateRecursivelyWithoutExistPath);
  }

  function changeIsExistHandler() {
    setIsExist(true);
  }

  function createSubordinatedList() {
    return subordinatedPaths.map((duplicatedNewPath) => {
      const isExistPath = dummyExistPaths.includes(duplicatedNewPath);
      let result;
      if (isExistPath) {
        result = <li className="duplicate-exist" key={duplicatedNewPath}> {duplicatedNewPath}: { t('modal_duplicate.label.Same page already exists') } </li>;
      }
      else {
        result = <li key={duplicatedNewPath}>{duplicatedNewPath}</li>;
      }
      return result;
    });
  }

  const getSubordinatedList = useCallback(async() => {
    try {
      const res = await appContainer.apiv3Get('/pages/subordinated-list', { path });
      setSubordinatedPaths(res.data.resultPaths);
    }
    catch (err) {
      setGetSuborinatedError(t('modal_duplicate.label.Fail to get subordinated pages'));
    }
  }, [appContainer, path, t]);

  useEffect(() => {
    if (props.isOpen) {
      getSubordinatedList();
    }
  }, [props.isOpen, getSubordinatedList]);

  const checkExistPath = useCallback(() => {
    subordinatedPaths.map((duplicatedNewPath) => {
      const existPath = dummyExistPaths.includes(duplicatedNewPath);
      if (existPath) {
        changeIsExistHandler();
      }
      return;
    });
  }, [dummyExistPaths, subordinatedPaths]);

  useEffect(() => {
    if (props.isOpen) {
      checkExistPath();
    }
  }, [props.isOpen, checkExistPath]);

  async function duplicate() {
    setErrs(null);

    try {
      const res = await appContainer.apiv3Post('/pages/duplicate', { pageId, pageNameInput });
      const { page } = res.data;
      window.location.href = encodeURI(`${page.path}?duplicated=${path}`);
    }
    catch (err) {
      setErrs(err);
    }
  }

  function ppacSubmitHandler() {
    duplicate();
  }

  return (
    <Modal size="lg" isOpen={props.isOpen} toggle={props.onClose} className="grw-duplicate-page">
      <ModalHeader tag="h4" toggle={props.onClose} className="bg-primary text-light">
        { t('modal_duplicate.label.Duplicate page') }
      </ModalHeader>
      <ModalBody>
        <div className="form-group"><label>{t('modal_duplicate.label.Current page name')}</label><br />
          <code>{path}</code>
        </div>
        <div className="form-group">
          <label htmlFor="duplicatePageName">{ t('modal_duplicate.label.New page name') }</label><br />
          <div className="input-group">
            <div className="input-group-prepend">
              <span className="input-group-text">{crowi.url}</span>
            </div>
            <div className="flex-fill">
              {isReachable
              ? (
                <PagePathAutoComplete
                  initializedPath={path}
                  onSubmit={ppacSubmitHandler}
                  onInputChange={ppacInputChangeHandler}
                />
              )
              : (
                <input
                  type="text"
                  value={pageNameInput}
                  className="form-control"
                  onChange={e => inputChangeHandler(e.target.value)}
                  required
                />
              )}
            </div>
          </div>
        </div>
        <div className="custom-control custom-checkbox custom-checkbox-warning">
          <input
            className="custom-control-input"
            name="recursively"
            id="cbDuplicateRecursively"
            type="checkbox"
            checked={isDuplicateRecursively}
            onChange={changeIsDuplicateRecursivelyHandler}
          />
          <label className="custom-control-label" htmlFor="cbDuplicateRecursively">
            { t('modal_duplicate.label.Duplicate with child') }
          </label>
        </div>

        <div className="custom-control custom-checkbox custom-checkbox-warning" style={{ display: isExist && isDuplicateRecursively ? '' : 'none' }}>
          <input
            className="custom-control-input"
            name="withoutExistRecursively"
            id="cbDuplicatewithoutExistRecursively"
            type="checkbox"
            checked={isDuplicateRecursivelyWithoutExistPath}
            onChange={changeIsDuplicateRecursivelyWithoutExistPathHandler}
          />
          <label className="custom-control-label" htmlFor="cbDuplicatewithoutExistRecursively">
            { t('modal_duplicate.label.Duplicate without exist path') }
          </label>
        </div>

        <div>
          <ul className="duplicate-name">
            {isDuplicateRecursively && createSubordinatedList()}
          </ul>
        </div>
        <div> {getSubordinatedError} </div>
      </ModalBody>
      <ModalFooter>
        <ApiErrorMessageList errs={errs} targetPath={pageNameInput} />
        <button type="button" className="btn btn-primary" onClick={duplicate}>Duplicate page</button>
      </ModalFooter>
    </Modal>
  );
};


/**
 * Wrapper component for using unstated
 */
const PageDuplicateModallWrapper = withUnstatedContainers(PageDuplicateModal, [AppContainer, PageContainer]);


PageDuplicateModal.propTypes = {
  t: PropTypes.func.isRequired, //  i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  pageContainer: PropTypes.instanceOf(PageContainer).isRequired,

  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default withTranslation()(PageDuplicateModallWrapper);
