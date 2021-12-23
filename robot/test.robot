*** Settings ***
Library           SeleniumLibrary
Library           BuiltIn
Library           String
Resource          resource.robot
Suite Setup       Open Browser       about:blank    firefox
Suite Teardown    Close Browser

*** Keywords ***
Input Username and Password
    [Arguments]                  ${xpath_user}    ${xpath_pass}    ${username}    ${password}
    Element Should Be Visible    ${xpath_user}
    Element Should Be Visible    ${xpath_pass}
    Input Text                   ${xpath_user}    ${username}
    Input Text                   ${xpath_pass}    ${password}
Click Button
    [Arguments]                      ${btn}
    Wait Until Element Is Visible    ${btn}
    Click Element                    ${btn}
Element should have text
    [Arguments]                      ${locator}        ${expect_text}
    Wait Until Element Is Visible    ${locator}
    ${result_text}                   Get Text          xpath=${locator}
    Should Be Equal As Strings       ${result_text}    ${expect_text}
Element class should found
    [Arguments]                      ${locator}               ${expect_text}
    Wait Until Element Is Visible    ${locator}
    ${result_text}=                  Get Element Attribute    xpath=${locator}                                class
    ${contains}=                     Evaluate                 """${expect_text}""" in """${result_text}"""
    Should Be True                   ${contains}
Wait
    [Arguments]    ${DELAY}
    Sleep          ${DELAY}
*** Test Cases ***
Login - Failed (wrong only username)
    [tags]                         fail
    Go To                          ${url}
    Wait                           1s
    Click Button                   ${btn_login}
    Input Username and Password    ${input_user}       ${input_pass}                        ${user_fail}    ${pwd_pass} 
    Click Button                   ${btn_login_now}
    Wait                           2s
    Element should have text       ${text_message}     Please Check username or password
Login - Failed (wrong only password)
    [tags]                           fail
    Go To                            ${url}
    Wait                             1s
    Wait Until Element Is Visible    ${btn_login}
    Click Button                     ${btn_login}
    Input Username and Password      ${input_user}       ${input_pass}                        ${user_pass}    ${pwd_fail} 
    Click Button                     ${btn_login_now}
    Wait                             5s
    Element should have text         ${text_message}     Please Check username or password
Login - Failed (wrong username and password)
    [tags]                           fail
    Go To                            ${url}
    Wait                             1s
    Wait Until Element Is Visible    ${btn_login}
    Click Button                     ${btn_login}
    Input Username and Password      ${input_user}       ${input_pass}                        ${user_fail}    ${pwd_fail} 
    Click Button                     ${btn_login_now}
    Wait                             2s
    Element should have text         ${text_message}     Please Check username or password
Login - Required (username and password)
    [tags]                           fail
    Go To                            ${url}
    Wait                             1s
    Wait Until Element Is Visible    ${btn_login}
    Click Button                     ${btn_login}
    Input Username and Password      ${input_user}       ${input_pass}         ${user_null}    ${pwd_null} 
    Click Button                     ${btn_login_now}
    Wait                             2s
    Element class should found       ${input_user}       ${input_required}
    Element class should found       ${input_pass}       ${input_required} 
Login - Passed (correct username and password)
    [tags]                           fail
    Go To                            ${url}
    Wait                             1s
    Wait Until Element Is Visible    ${btn_login}
    Click Button                     ${btn_login}
    Input Username and Password      ${input_user}       ${input_pass}     ${user_pass}    ${pwd_pass} 
    Click Button                     ${btn_login_now}
    Wait                             5s
    Element should have text         ${text_message}     Successfully !

# Finally tests should be finished in 41s