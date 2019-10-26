import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import api from '../../services/api';

import Container from '../../components/Container';
import { Loading, Owner, IssueList, ButtonContainer, Button } from './styles';

export default class Repository extends Component {
  state = {
    repository: {},
    issues: [],
    loading: true,
    issueState: 'open',
    page: 1,
  };

  async componentDidMount() {
    const { match } = this.props;
    const { issueState } = this.state;

    const repoName = decodeURIComponent(match.params.repository);

    const [repository, issues] = await Promise.all([
      api.get(`/repos/${repoName}`),
      api.get(`/repos/${repoName}/issues`, {
        params: {
          state: issueState,
        },
      }),
    ]);

    this.setState({
      repository: repository.data,
      issues: issues.data,
      loading: false,
    });
  }

  loadIssues = async () => {
    const { match } = this.props;
    const repoName = decodeURIComponent(match.params.repository);
    const { issueState, page } = this.state;

    const issues = await api.get(`/repos/${repoName}/issues`, {
      params: {
        state: issueState,
        per_page: 5,
        page,
      },
    });

    this.setState({ issues: issues.data });
  };

  handleChangeIssueState = async value => {
    await this.setState({ issueState: value });
    this.loadIssues();
  };

  handleChangePage = async page => {
    await this.setState({ page });
    this.loadIssues();
  };

  render() {
    const { repository, issues, loading, issueState, page } = this.state;

    if (loading) {
      return <Loading>Carregando</Loading>;
    }

    return (
      <Container>
        <Owner>
          <Link to="/">Voltar aos repositórios</Link>
          <img src={repository.owner.avatar_url} alt={repository.owner.login} />
          <h1>{repository.name}</h1>
          <p>{repository.description}</p>
        </Owner>

        <IssueList>
          <ButtonContainer>
            <Button
              onClick={() => this.handleChangeIssueState('open')}
              active={issueState === 'open'}
            >
              Abertas
            </Button>
            <Button
              onClick={() => this.handleChangeIssueState('closed')}
              active={issueState === 'closed'}
            >
              Fechadas
            </Button>
            <Button
              onClick={() => this.handleChangeIssueState('all')}
              active={issueState === 'all'}
            >
              Todas
            </Button>
          </ButtonContainer>

          {issues.map(issue => (
            <li key={String(issue.id)}>
              <img src={issue.user.avatar_url} alt={issue.user.login} />
              <div>
                <strong>
                  <a href={issue.html_url}>{issue.title}</a>
                  {issue.labels.map(label => (
                    <span key={String(label.id)}>{label.name}</span>
                  ))}
                </strong>
                <p>{issue.user.login}</p>
              </div>
            </li>
          ))}
        </IssueList>

        <ButtonContainer>
          <Button
            disabled={page === 1}
            onClick={() => this.handleChangePage(page - 1)}
          >
            Anterior
          </Button>
          <span>{page}</span>
          <Button onClick={() => this.handleChangePage(page + 1)}>
            Próximo
          </Button>
        </ButtonContainer>
      </Container>
    );
  }
}

Repository.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      repository: PropTypes.string,
    }),
  }).isRequired,
};
