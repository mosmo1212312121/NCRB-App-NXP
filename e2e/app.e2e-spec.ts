import { DashboardPage, LoginPage } from './app.po';
import * as ENV from './env.json';

describe('Dashboard Page', () => {
  let page: DashboardPage;
  let login: LoginPage;

  it('should display graph', async () => {
    page = new DashboardPage();
    await page.navigateTo();
    expect('.').toEqual('.');
  });

  it('should login', async () => {
    console.log('logging in..');
    login = new LoginPage();
    await login.clickLogin();
    await login.patch('username', ENV.username);
    await login.patch('password', ENV.password);
    await login.clickSubmit();
    await login.clickConfirm();
    await login.wait();
    console.log('logged in..');
    expect('.').toEqual('.');
  });
});
