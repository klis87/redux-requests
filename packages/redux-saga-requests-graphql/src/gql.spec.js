import { gql } from './gql';

describe('gql', () => {
  it('handles queries without variables', () => {
    expect(gql`
      query {
        x
      }
    `).toMatchSnapshot();
  });

  it('handles queries with variables', () => {
    expect(gql`
      query($id: ID!) {
        x(id: $id) {
          y
        }
      }
    `).toMatchSnapshot();
  });

  it('handles fragments', () => {
    const bookFragment = gql`
      fragment BookFragment on Book {
        id
        title
      }
    `;

    expect(gql`
      query($id: ID!) {
        book(id: $id) {
          ...BookFragment
        }
      }
      ${bookFragment}
    `).toMatchSnapshot();
  });
});
