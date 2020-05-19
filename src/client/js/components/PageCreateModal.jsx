
import React, { useState } from 'react';
import PropTypes from 'prop-types';

import { Modal, ModalHeader, ModalBody } from 'reactstrap';

import { withTranslation } from 'react-i18next';
import { format } from 'date-fns';
import urljoin from 'url-join';

import { userPageRoot } from '@commons/util/path-utils';
import { pathUtils } from 'growi-commons';
import { createSubscribedElement } from './UnstatedUtils';

import AppContainer from '../services/AppContainer';
import PageContainer from '../services/PageContainer';
import PagePathAutoComplete from './PagePathAutoComplete';

const PageCreateModal = (props) => {
  const { t, appContainer, pageContainer } = props;

  const config = appContainer.getConfig();
  const isReachable = config.isSearchServiceReachable;
  const { path } = pageContainer.state;
  const userPageRootPath = userPageRoot(appContainer.currentUser);
  const parentPath = pathUtils.addTrailingSlash(path);
  const now = format(new Date(), 'yyyy/MM/dd');

  const [todayInput1, setTodayInput1] = useState(t('Memo'));
  const [todayInput2, setTodayInput2] = useState('');
  const [pageNameInput, setPageNameInput] = useState(parentPath);
  const [template, setTemplate] = useState(null);

  /**
   * change todayInput1
   * @param {string} value
   */
  function onChangeTodayInput1Handler(value) {
    setTodayInput1(value);
  }

  /**
   * change todayInput2
   * @param {string} value
   */
  function onChangeTodayInput2Handler(value) {
    setTodayInput2(value);
  }

  /**
   * change pageNameInput
   * @param {string} value
   */
  function onChangePageNameInputHandler(value) {
    setPageNameInput(value);
  }

  /**
   * change template
   * @param {string} value
   */
  function onChangeTemplateHandler(value) {
    setTemplate(value);
  }

  /**
   * access today page
   */
  function createTodayPage() {
    let tmpTodayInput1 = todayInput1;
    if (tmpTodayInput1 === '') {
      tmpTodayInput1 = t('Memo');
    }
    window.location.href = encodeURI(urljoin(userPageRootPath, tmpTodayInput1, now, todayInput2, '#edit'));
  }

  /**
   * access input page
   */
  function createInputPage() {
    window.location.href = encodeURI(urljoin(pageNameInput, '#edit'));
  }

  /**
   * access template page
   */
  function createTemplatePage() {
    const pageName = (template === 'children') ? '_template' : '__template';
    window.location.href = encodeURI(urljoin(parentPath, pageName, '#edit'));
  }

  function renderCreateTodayForm() {
    return (
      <div className="row">
        <fieldset className="col-12 mb-4">
          <h3 className="grw-modal-head pb-2">{ t("Create today's") }</h3>

          <div className="d-sm-flex flex align-items-center justify-items-between">

            <div className="d-flex align-items-center flex-fill flex-wrap flex-lg-nowrap">
              <div className="d-flex align-items-center">
                <span>{userPageRootPath}/</span>
                <input
                  type="text"
                  className="page-today-input1 form-control text-center mx-2"
                  value={todayInput1}
                  onChange={e => onChangeTodayInput1Handler(e.target.value)}
                />
                <span className="page-today-suffix">/{now}/</span>
              </div>
              <input
                type="text"
                className="page-today-input2 form-control mt-1 mt-lg-0 mx-lg-2 flex-fill"
                id="page-today-input2"
                placeholder={t('Input page name (optional)')}
                value={todayInput2}
                onChange={e => onChangeTodayInput2Handler(e.target.value)}
              />
            </div>

            <div className="d-flex justify-content-end mt-1 mt-sm-0">
              <button type="button" className="btn btn-outline-primary rounded-pill text-nowrap ml-3" onClick={createTodayPage}>
                <i className="icon-fw icon-doc"></i>{ t('Create') }
              </button>
            </div>

          </div>

        </fieldset>
      </div>
    );
  }

  function renderInputPageForm() {
    return (
      <div className="row form-group">
        <fieldset className="col-12 mb-4">
          <h3 className="grw-modal-head pb-2">{ t('Create under') }</h3>
          <div className="d-flex create-page-input-container">
            <div className="create-page-input-row d-flex align-items-center flex-fill">
              {isReachable
                // GW-2355 refactor typeahead
                ? <PagePathAutoComplete crowi={appContainer} initializedPath={path} addTrailingSlash />
                : (
                  <input
                    type="text"
                    value={pageNameInput}
                    className="form-control flex-fill"
                    placeholder={t('Input page name')}
                    onChange={e => onChangePageNameInputHandler(e.target.value)}
                    required
                  />
                )}
            </div>
            <div className="create-page-button-container">
              <button type="submit" className="btn btn-outline-primary rounded-pill" onClick={createInputPage}>
                <i className="icon-fw icon-doc"></i>{ t('Create') }
              </button>
            </div>
          </div>
        </fieldset>
      </div>
    );
  }

  function renderTemplatePageForm() {
    return (
      <div className="row form-group">
        <fieldset className="col-12">
          <h3 className="grw-modal-head pb-2">{ t('template.modal_label.Create template under')}<br />
            <code>{path}</code>
          </h3>
          <div className="d-sm-flex create-page-input-container">
            <div className="create-page-input-row d-flex align-items-center flex-fill">

              <div id="dd-template-type" className="dropdown w-100">
                <button id="template-type" type="button" className="btn btn-secondary btn dropdown-toggle w-100" data-toggle="dropdown">
                  {template == null && t('template.option_label.select') }
                  {template === 'children' && t('template.children.label')}
                  {template === 'decendants' && t('template.decendants.label')}
                </button>
                <div className="dropdown-menu" aria-labelledby="userMenu">
                  <a className="dropdown-item" type="button" onClick={() => onChangeTemplateHandler('children')}>
                    { t('template.children.label') } (_template)<br className="d-block d-md-none" />
                    <small className="text-muted text-wrap">- { t('template.children.desc') }</small>
                  </a>
                  <a className="dropdown-item" type="button" onClick={() => onChangeTemplateHandler('decendants')}>
                    { t('template.decendants.label') } (__template) <br className="d-block d-md-none" />
                    <small className="text-muted">- { t('template.decendants.desc') }</small>
                  </a>
                </div>
              </div>

            </div>
            <div className="create-page-button-container float-right ml-3 mt-3 mt-sm-0">
              <button type="button" className={`btn btn-outline-primary rounded-pill ${template == null && 'disabled'}`} onClick={createTemplatePage}>
                <i className="icon-fw icon-doc"></i>
                <span>{ t('Edit') }</span>
              </button>
            </div>
          </div>
        </fieldset>
      </div>
    );
  }
  return (
    <Modal size="lg" isOpen={appContainer.state.isPageCreateModalShown} toggle={appContainer.closePageCreateModal} className="grw-create-page">
      <ModalHeader tag="h4" toggle={appContainer.closePageCreateModal} className="bg-primary text-light">
        { t('New Page') }
      </ModalHeader>
      <ModalBody>
        {renderCreateTodayForm()}
        {renderInputPageForm()}
        {renderTemplatePageForm()}
      </ModalBody>
    </Modal>

  );
};


/**
 * Wrapper component for using unstated
 */
const ModalControlWrapper = (props) => {
  return createSubscribedElement(PageCreateModal, props, [AppContainer, PageContainer]);
};


PageCreateModal.propTypes = {
  t: PropTypes.func.isRequired, //  i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  pageContainer: PropTypes.instanceOf(PageContainer).isRequired,
};

export default withTranslation()(ModalControlWrapper);
