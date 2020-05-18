import React from 'react';
import PropTypes from 'prop-types';

import { withTranslation } from 'react-i18next';

import { createSubscribedElement } from '../UnstatedUtils';
import AppContainer from '../../services/AppContainer';

const PageCreateButton = (props) => {
  const { t, appContainer } = props;

  return (
    <a className="nav-link create-page" type="button" onClick={appContainer.openPageCreateModal}>
      <i className="icon-pencil mr-2"></i>
      <span>{ t('New') }</span>
    </a>
  );
};

/**
 * Wrapper component for using unstated
 */
const PageCreateButtonWrapper = (props) => {
  return createSubscribedElement(PageCreateButton, props, [AppContainer]);
};


PageCreateButton.propTypes = {
  t: PropTypes.func.isRequired, //  i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
};

export default withTranslation()(PageCreateButtonWrapper);
