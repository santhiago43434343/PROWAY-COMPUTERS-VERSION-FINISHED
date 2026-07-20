require "test_helper"

class Api::V1::CheckoutsControllerTest < ActionDispatch::IntegrationTest
  test "should get create" do
    get api_v1_checkouts_create_url
    assert_response :success
  end
end
