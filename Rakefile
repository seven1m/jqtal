LIB_PATH = File.expand_path('../lib', __FILE__)

desc 'Minify JavaScript'
task :minify do
  require 'rubygems'
  require 'uglifier'
  min = Uglifier.new.compile(File.read(LIB_PATH + '/jqtal.js'))
  File.open(LIB_PATH + '/jqtal.min.js', 'w') { |f| f.write(min) }
  puts `wc -m #{LIB_PATH + '/jqtal.js'}`
  puts `wc -m #{LIB_PATH + '/jqtal.min.js'}`
end
